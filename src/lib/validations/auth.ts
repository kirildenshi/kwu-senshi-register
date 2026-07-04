import { z } from 'zod';
import { isLatinName, isLatinText } from '@/lib/i18n/latin-text';
import { calculateAge } from '@/lib/utils/age';

const LATIN_NAME_MSG = 'Name must use Latin letters only (no Cyrillic)';
const LATIN_TEXT_MSG = 'This field must use Latin characters only (no Cyrillic)';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
  .refine((val) => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter' })
  .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one digit' });

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  code?: string;
  error?: {
    code: string;
    message: string;
  };
};

export function apiSuccess<T>(data?: T, i18nKey?: string): ApiResponse<T> {
  return {
    success: true,
    ...(data !== undefined && { data }),
    ...(i18nKey && { code: i18nKey }),
  };
}

export function apiError(code: string, message: string, i18nKey?: string): ApiResponse {
  return {
    success: false,
    error: { code, message },
    ...(i18nKey && { code: i18nKey }),
  };
}

// Full registration schema — Alliance Member + Dojo Operator only.
export const fullRegistrationSchema = z
  .object({
    // Account
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
    role: z.enum(['ALLIANCE_MEMBER', 'DOJO_OPERATOR']),
    lang: z.enum(['en', 'bg']).default('en'),

    // Person
    fullName: z.string().min(2).max(80).refine(isLatinName, LATIN_NAME_MSG),
    sex: z.enum(['MASCULINE', 'FEMININE', 'OTHER']).optional().or(z.literal('')),
    dateOfBirth: z.string().optional().or(z.literal('')),
    countryOfOrigin: z.string().min(1),

    // Minor/guardian consent (Alliance Member only) — see the superRefine
    // below for the actual age-gate and conditional-required enforcement.
    isMinorGuardian: z.boolean().optional(),
    parentFullName: z.string().refine(isLatinName, LATIN_NAME_MSG).optional().or(z.literal('')),
    parentPhone: z.string().refine(
      (val) => !val || /^\+[1-9]\d{1,14}$/.test(val.replace(/[\s\-().]/g, '')),
      'Use international format: +1234567890',
    ).optional().or(z.literal('')),

    // Contact
    telephone: z.string().min(1),
    addressLine1: z.string().min(1).refine(isLatinText, LATIN_TEXT_MSG),
    city: z.string().min(1).refine(isLatinText, LATIN_TEXT_MSG),
    stateProvince: z.string().refine(isLatinText, LATIN_TEXT_MSG).optional().or(z.literal('')),
    zipCode: z.string().refine(isLatinText, LATIN_TEXT_MSG).optional().or(z.literal('')),
    country: z.string().min(1),

    // Identity
    governmentId: z.string().refine(isLatinText, LATIN_TEXT_MSG).optional().or(z.literal('')),
    cpf: z.string().optional().or(z.literal('')),
    fatherName: z.string().refine(isLatinName, LATIN_NAME_MSG).optional().or(z.literal('')),
    motherName: z.string().refine(isLatinName, LATIN_NAME_MSG).optional().or(z.literal('')),
    medicalInsurance: z.string().refine(isLatinText, LATIN_TEXT_MSG).optional().or(z.literal('')),

    // Martial Arts (Alliance Member)
    currentRank: z.string().optional().or(z.literal('')),

    // Dojo — AM: the club they train at (or empty/sentinel for "not a member");
    // DO: the dojo they're registering.
    dojoName: z.string().optional().or(z.literal('')),
    dojoAddress: z.string().optional().or(z.literal('')),
    dojoCity: z.string().refine(isLatinText, LATIN_TEXT_MSG).optional().or(z.literal('')),
    dojoCountry: z.string().optional().or(z.literal('')),
    dojoDescription: z.string().optional().or(z.literal('')),

    // GDPR consent
    dataAccuracyDeclaration: z.literal(true, { message: 'You must declare that the information you provided is accurate' }),
    ageConfirmation: z.literal(true, { message: 'You must confirm you are 16 or older' }),
    marketingConsent: z.boolean().optional(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    { message: 'Passwords do not match', path: ['confirmPassword'] },
  )
  .refine(
    (data) => {
      const username = data.email.split('@')[0].toLowerCase();
      return !data.password.toLowerCase().includes(username);
    },
    { message: 'Password cannot contain part of your email', path: ['password'] },
  )
  .superRefine((data, ctx) => {
    if (!data.dateOfBirth) return;
    const age = calculateAge(data.dateOfBirth);
    if (age === null) return;

    // Dojo Operator: flat 16+ requirement, no guardian exception.
    if (data.role === 'DOJO_OPERATOR') {
      if (age < 16) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'You must be at least 16 years old to register.',
          path: ['dateOfBirth'],
        });
      }
      return;
    }

    // Minor/guardian gate (Alliance Member only, mirrors the client-side
    // check in registration.ts's buildRegistrationSchema — this is the copy
    // that's actually authoritative, since the server never trusts the client).
    if (data.role !== 'ALLIANCE_MEMBER') return;

    const isGuardian = data.isMinorGuardian === true;
    if (!isGuardian && age < 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must be at least 16 years old to register. If you are under 16, please have a parent or guardian register on your behalf.',
        path: ['dateOfBirth'],
      });
    }
    if (isGuardian) {
      if (!data.parentFullName || data.parentFullName.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'This field is required', path: ['parentFullName'] });
      }
      if (!data.parentPhone || data.parentPhone.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'This field is required', path: ['parentPhone'] });
      }
    }
  });
