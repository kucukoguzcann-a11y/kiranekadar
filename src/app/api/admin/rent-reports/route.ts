import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// GET: List all reports for moderation
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const reports = await prisma.rentReport.findMany({
      where,
      include: {
        city: { select: { name: true } },
        district: { select: { name: true } },
        neighborhood: { select: { name: true } },
      },
      orderBy: [
        { status: 'asc' }, // usually 'approved' is last, pending/flagged first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(reports);

  } catch (error) {
    console.error('Admin list reports error:', error);
    return NextResponse.json({ error: 'Veriler listelenemedi' }, { status: 500 });
  }
}

// PATCH: Moderate a report (approve / reject / flag)
export async function PATCH(request: NextRequest) {
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

    const { id, status, rejectedReason } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'id ve status parametreleri zorunludur' }, { status: 400 });
    }

    const validStatuses = ['approved', 'rejected', 'pending', 'flagged'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Geçersiz statü değeri' }, { status: 400 });
    }

    const report = await prisma.rentReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    const updated = await prisma.rentReport.update({
      where: { id },
      data: {
        status,
        rejectedReason: status === 'rejected' ? rejectedReason || 'Gerekçe belirtilmedi' : null,
        approvedAt: status === 'approved' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, report: updated });

  } catch (error) {
    console.error('Admin moderate report error:', error);
    return NextResponse.json({ error: 'Moderasyon işlemi gerçekleştirilemedi' }, { status: 500 });
  }
}
