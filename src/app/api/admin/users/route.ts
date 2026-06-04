import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Auth Guard
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('kira-auth');
    let user = null;
    
    if (authCookie?.value) {
      user = JSON.parse(authCookie.value);
    }
    
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { rentReports: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Admin list users error:', error);
    return NextResponse.json({ error: 'Kullanıcılar listelenemedi' }, { status: 500 });
  }
}
