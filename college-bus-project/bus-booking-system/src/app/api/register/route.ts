import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
  role: z.enum(['PASSENGER', 'ADMIN', 'DRIVER']).default('PASSENGER'),
});

export async function POST(request: Request) {
  try {
    const input = registrationSchema.parse(await request.json());
    const email = input.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    await prisma.user.create({
      data: { name: input.name, email, passwordHash, role: input.role },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid registration details.' }, { status: 400 });
    }

    console.error('Registration failed', error);
    return NextResponse.json({ error: 'Unable to create your account right now.' }, { status: 500 });
  }
}
