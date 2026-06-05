import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('kira-auth');

    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const sessionUser = JSON.parse(authCookie.value) as { email?: string };
    if (!sessionUser.email) {
      return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'Tüm alanlar zorunlu' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Yeni şifre en az 8 karakter olmalı' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Yeni şifreler eşleşmiyor' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });

    return NextResponse.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ error: 'Şifre güncellenemedi' }, { status: 500 });
  }
}
