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
    const search = searchParams.get('search') || '';
    const cityId = searchParams.get('cityId') ? parseInt(searchParams.get('cityId')!) : undefined;
    const districtId = searchParams.get('districtId') ? parseInt(searchParams.get('districtId')!) : undefined;
    const roomCount = searchParams.get('roomCount') || undefined;
    const propertyType = searchParams.get('propertyType') || undefined;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (cityId) {
      where.cityId = cityId;
    }
    if (districtId) {
      where.districtId = districtId;
    }
    if (roomCount && roomCount !== 'all') {
      where.roomCount = roomCount;
    }
    if (propertyType && propertyType !== 'all') {
      where.propertyType = propertyType;
    }
    if (search.trim()) {
      where.OR = [
        { neighborhood: { name: { contains: search, mode: 'insensitive' } } },
        { ipHash: { contains: search, mode: 'insensitive' } },
        { userId: { contains: search, mode: 'insensitive' } },
      ];
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

// PATCH: Moderate or edit a report
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

    const body = await request.json();
    const {
      id,
      status,
      rejectedReason,
      rentAmount,
      duesAmount,
      netSqm,
      roomCount,
      propertyType,
      buildingAgeRange,
      hasElevator,
      isFurnished,
      isInSite,
      hasParking
    } = body;

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

    const dataToUpdate: any = {
      status,
      rejectedReason: status === 'rejected' ? rejectedReason || 'Gerekçe belirtilmedi' : null,
      approvedAt: status === 'approved' ? new Date() : null,
    };

    if (rentAmount !== undefined) dataToUpdate.rentAmount = parseInt(rentAmount);
    if (duesAmount !== undefined) dataToUpdate.duesAmount = duesAmount !== null && duesAmount !== '' ? parseInt(duesAmount) : null;
    if (netSqm !== undefined) dataToUpdate.netSqm = parseInt(netSqm);
    if (roomCount !== undefined) dataToUpdate.roomCount = roomCount;
    if (propertyType !== undefined) dataToUpdate.propertyType = propertyType;
    if (buildingAgeRange !== undefined) dataToUpdate.buildingAgeRange = buildingAgeRange;
    if (hasElevator !== undefined) dataToUpdate.hasElevator = Boolean(hasElevator);
    if (isFurnished !== undefined) dataToUpdate.isFurnished = Boolean(isFurnished);
    if (isInSite !== undefined) dataToUpdate.isInSite = Boolean(isInSite);
    if (hasParking !== undefined) dataToUpdate.hasParking = Boolean(hasParking);

    const updated = await prisma.rentReport.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, report: updated });

  } catch (error) {
    console.error('Admin moderate report error:', error);
    return NextResponse.json({ error: 'Moderasyon işlemi gerçekleştirilemedi' }, { status: 500 });
  }
}

// DELETE: Delete a report permanently
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parametresi zorunludur' }, { status: 400 });
    }

    const report = await prisma.rentReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    await prisma.rentReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Kayıt kalıcı olarak silindi' });

  } catch (error) {
    console.error('Admin delete report error:', error);
    return NextResponse.json({ error: 'Kayıt silinemedi' }, { status: 500 });
  }
}
