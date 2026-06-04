import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DEMO_USERS = [
  { email: 'admin@example.com', password: 'Admin123!', role: 'admin', name: 'Admin Kullanıcı' },
  { email: 'user@example.com', password: 'User123!', role: 'user', name: 'Demo Kullanıcı' },
  { email: 'moderator@example.com', password: 'Mod123!', role: 'moderator', name: 'Moderatör' },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const userData = { email: user.email, role: user.role, name: user.name };
    cookieStore.set('kira-auth', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ user: userData });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
