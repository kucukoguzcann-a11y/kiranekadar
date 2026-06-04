import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('kira-auth');
    
    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const userObj = JSON.parse(authCookie.value);
    const dbUser = await prisma.user.findUnique({
      where: { email: userObj.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Verify ownership or admin status
    const report = await prisma.rentReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    if (report.userId !== dbUser.id && dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Bu veriyi silme yetkiniz bulunmamaktadır' }, { status: 403 });
    }

    await prisma.rentReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Kayıt silindi' });

  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json({ error: 'Kayıt silinemedi' }, { status: 500 });
  }
}
