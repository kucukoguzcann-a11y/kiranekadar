import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityIdStr = searchParams.get('cityId');

    if (!cityIdStr) {
      return NextResponse.json({ error: 'cityId parametresi zorunludur' }, { status: 400 });
    }

    const cityId = parseInt(cityIdStr);
    if (isNaN(cityId)) {
      return NextResponse.json({ error: 'Geçersiz cityId' }, { status: 400 });
    }

    const districts = await prisma.district.findMany({
      where: { cityId },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(districts);
  } catch (error) {
    return NextResponse.json({ error: 'İlçeler yüklenemedi' }, { status: 500 });
  }
}
