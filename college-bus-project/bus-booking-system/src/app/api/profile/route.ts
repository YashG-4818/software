import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(30),
  city: z.string().trim().max(80),
});

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        city: user.city ?? '',
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Profile lookup failed', error);
    return NextResponse.json({ error: 'Unable to load your profile.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const input = profileSchema.parse(await request.json());
    const normalizedEmail = input.email.toLowerCase();
    const emailOwner = await prisma.user.findFirst({
      where: { email: normalizedEmail, NOT: { id: user.id } },
      select: { id: true },
    });

    if (emailOwner) {
      return NextResponse.json({ error: 'That email address is already in use.' }, { status: 409 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: input.name,
        email: normalizedEmail,
        phone: input.phone || null,
        city: input.city || null,
      },
    });

    return NextResponse.json({
      profile: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone ?? '',
        city: updatedUser.city ?? '',
        role: updatedUser.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid profile details.' }, { status: 400 });
    }

    console.error('Profile update failed', error);
    return NextResponse.json({ error: 'Unable to save your profile right now.' }, { status: 500 });
  }
}
