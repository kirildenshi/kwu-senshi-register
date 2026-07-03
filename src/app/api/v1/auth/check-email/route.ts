export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  // Query DB for consistent timing, but always return available: true to
  // prevent email enumeration — the real uniqueness check happens on submit.
  await prisma.account.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  });

  return NextResponse.json({ available: true });
}
