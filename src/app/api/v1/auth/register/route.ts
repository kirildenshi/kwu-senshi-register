export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { fullRegistrationSchema, apiSuccess, apiError } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth-utils';
import { NOT_A_MEMBER_DOJO_ID } from '@/data/form-configs';
import type { Sex } from '@prisma/client';

const BOOLEAN_FIELDS = ['ageConfirmation', 'dataAccuracyDeclaration', 'marketingConsent'];

async function parseMultipartBody(req: Request): Promise<{ body: Record<string, unknown>; files: Record<string, File> }> {
  const formData = await req.formData();
  const body: Record<string, unknown> = {};
  const files: Record<string, File> = {};

  formData.forEach((value, key) => {
    if (value instanceof File) {
      if (value.size > 0) files[key] = value;
      return;
    }
    body[key] = BOOLEAN_FIELDS.includes(key) ? value === 'true' : value;
  });

  return { body, files };
}

const FILE_FIELD_DOCUMENT_TYPE: Record<string, 'RANK_CERTIFICATE' | 'DOJO_PROOF' | 'GOVERNMENT_ID' | 'INSURANCE'> = {
  rankCertificate: 'RANK_CERTIFICATE',
  dojoProof: 'DOJO_PROOF',
  governmentIdDoc: 'GOVERNMENT_ID',
  insuranceDoc: 'INSURANCE',
};

const ALLOWED_DOCUMENT_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Saves uploaded registration documents to disk (public/uploads/documents/...)
// and records them against the application. Best-effort per file.
async function saveApplicationDocuments(accountId: string, applicationId: string, files: Record<string, File>) {
  for (const [fieldName, file] of Object.entries(files)) {
    const documentType = FILE_FIELD_DOCUMENT_TYPE[fieldName];
    if (!documentType) continue;

    if (!ALLOWED_DOCUMENT_TYPES.has(file.type) || file.size > MAX_DOCUMENT_SIZE) {
      console.error(`[REGISTER] Skipped document "${fieldName}": unsupported type or too large (${file.type}, ${file.size} bytes)`);
      continue;
    }

    try {
      const safeBasename = path.basename(file.name);
      const ext = path.extname(safeBasename).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const filename = `${randomUUID()}${ext ? `.${ext}` : ''}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents', accountId, documentType);
      const fileUrl = `/uploads/documents/${accountId}/${documentType}/${filename}`;

      await fs.mkdir(uploadDir, { recursive: true });
      const bytes = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, filename), bytes);

      await prisma.applicationDocument.create({
        data: {
          applicationId,
          type: documentType,
          fileUrl,
          fileName: safeBasename,
          fileSizeBytes: file.size,
          mimeType: file.type,
        },
      });
    } catch (err) {
      console.error(`[REGISTER] Failed to save document "${fieldName}":`, err instanceof Error ? err.message : err);
    }
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: Record<string, unknown>;
    let files: Record<string, File> = {};

    if (contentType.includes('multipart/form-data')) {
      ({ body, files } = await parseMultipartBody(req));
    } else {
      body = await req.json();
    }

    // dojoId (Alliance Member's selected club) isn't part of the shared
    // schema — same convention as the main platform's registration route.
    const dojoId = body.dojoId as string | undefined;

    const parsed = fullRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        apiError('VALIDATION_ERROR', `${firstError.path.join('.')}: ${firstError.message}`),
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (data.role === 'ALLIANCE_MEMBER' && !dojoId) {
      return NextResponse.json(
        apiError('VALIDATION_ERROR', 'Alliance Members must select a dojo or "not a member"'),
        { status: 400 },
      );
    }

    const existing = await prisma.account.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        apiError('EMAIL_EXISTS', 'An account with this email already exists'),
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(data.password);
    const isAllianceMember = data.role === 'ALLIANCE_MEMBER';
    const dojoName = isAllianceMember
      ? (dojoId === NOT_A_MEMBER_DOJO_ID ? null : dojoId ?? null)
      : (data.dojoName || null);

    const result = await prisma.$transaction(async (tx) => {
      const person = await tx.person.create({
        data: {
          name: data.fullName,
          sex: (data.sex as Sex) || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          countryOfOrigin: data.countryOfOrigin || null,
        },
      });

      await tx.contact.create({
        data: {
          personId: person.id,
          telephone: data.telephone || null,
          addressLine1: data.addressLine1 || null,
          city: data.city || null,
          stateProvince: data.stateProvince || null,
          zipCode: data.zipCode || null,
          country: data.country || null,
          governmentId: data.governmentId || null,
          cpf: data.cpf || null,
          fatherName: data.fatherName || null,
          motherName: data.motherName || null,
          medicalInsurance: data.medicalInsurance || null,
        },
      });

      const account = await tx.account.create({
        data: {
          personId: person.id,
          email: data.email,
          passwordHash,
          role: data.role,
          lang: data.lang,
        },
      });

      const application = await tx.registrationApplication.create({
        data: {
          accountId: account.id,
          role: data.role,
          currentRank: isAllianceMember ? (data.currentRank || null) : null,
          dojoName,
          dojoAddress: isAllianceMember ? null : (data.dojoAddress || null),
          dojoCity: data.dojoCity || null,
          dojoCountry: data.dojoCountry || null,
          dojoDescription: isAllianceMember ? null : (data.dojoDescription || null),
          dataAccuracyDeclaration: data.dataAccuracyDeclaration,
          ageConfirmation: data.ageConfirmation,
          marketingConsent: data.marketingConsent ?? false,
        },
      });

      return { account, application };
    });

    if (Object.keys(files).length > 0) {
      await saveApplicationDocuments(result.account.id, result.application.id, files);
    }

    return NextResponse.json(
      apiSuccess({ accountId: result.account.id }),
      { status: 201 },
    );
  } catch (err) {
    console.error('[REGISTER] Unexpected error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      apiError('INTERNAL_ERROR', 'Something went wrong. Please try again.'),
      { status: 500 },
    );
  }
}
