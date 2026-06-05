import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 });
    }

    // Set role to 'admin' for kucuk.oguzcann@gmail.com
    const role = email.toLowerCase() === 'kucuk.oguzcann@gmail.com' ? 'admin' : 'user';

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password,
        name: name || null,
        role,
      },
    });

    return NextResponse.json({
      message: 'Kayıt başarılı',
      user: { email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
