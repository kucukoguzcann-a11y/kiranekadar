import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const DEMO_USERS = [
  { email: 'admin@example.com', password: 'Admin123!', role: 'admin', name: 'Admin Kullanıcı' },
  { email: 'user@example.com', password: 'User123!', role: 'user', name: 'Demo Kullanıcı' },
  { email: 'moderator@example.com', password: 'Mod123!', role: 'moderator', name: 'Moderatör' },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = email.toLowerCase();

    // 1. Check database first
    let dbUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 2. If not in DB, check if it matches a demo user
    if (!dbUser) {
      const demoUser = DEMO_USERS.find(u => u.email === normalizedEmail && u.password === password);
      if (demoUser) {
        // Automatically register demo user in the DB so they are persisted
        dbUser = await prisma.user.create({
          data: {
            email: demoUser.email,
            password: demoUser.password,
            role: demoUser.role,
            name: demoUser.name,
          },
        });
      }
    }

    if (!dbUser || dbUser.password !== password) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
    }

    // 3. Update last login date
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { lastLoginAt: new Date() },
    });

    const cookieStore = await cookies();
    const userData = { email: dbUser.email, role: dbUser.role, name: dbUser.name };
    cookieStore.set('kira-auth', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
