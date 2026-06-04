import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { findSimilarProperties } from '@/lib/analytics-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const neighborhoodId = searchParams.get('neighborhoodId') ? parseInt(searchParams.get('neighborhoodId')!) : undefined;
    const districtId = searchParams.get('districtId') ? parseInt(searchParams.get('districtId')!) : undefined;
    const netSqm = searchParams.get('netSqm') ? parseInt(searchParams.get('netSqm')!) : undefined;
    const roomCount = searchParams.get('roomCount') || undefined;

    if (!districtId || !netSqm || !roomCount) {
      return NextResponse.json({ error: 'districtId, netSqm ve roomCount parametreleri zorunludur' }, { status: 400 });
    }

    // Query active reports in the same district/neighborhood
    const reports = await prisma.rentReport.findMany({
      where: {
        districtId,
        status: 'approved',
      },
      select: {
        rentAmount: true,
        netSqm: true,
        duesAmount: true,
        trustScore: true,
        createdAt: true,
        roomCount: true,
        buildingAgeRange: true,
        propertyType: true,
        neighborhoodId: true,
        districtId: true,
        isFurnished: true,
        isInSite: true,
      },
    });

    const mappedData = reports.map(r => ({
      rentAmount: r.rentAmount,
      netSqm: r.netSqm,
      duesAmount: r.duesAmount,
      trustScore: r.trustScore,
      createdAt: r.createdAt,
      roomCount: r.roomCount,
      buildingAgeRange: r.buildingAgeRange,
      propertyType: r.propertyType,
      neighborhoodId: r.neighborhoodId,
      districtId: r.districtId,
      isFurnished: r.isFurnished,
      isInSite: r.isInSite,
    }));

    // target object
    const target = {
      neighborhoodId: neighborhoodId || 0,
      districtId,
      roomCount,
      netSqm,
      buildingAgeRange: '',
      isFurnished: false,
      isInSite: false,
    };

    const similar = findSimilarProperties(target, mappedData);

    if (similar.length === 0) {
      return NextResponse.json({
        count: 0,
        minRent: 0,
        maxRent: 0,
        medianRent: 0,
        properties: [],
      });
    }

    const rents = similar.map(s => s.rentAmount).sort((a, b) => a - b);
    const minRent = rents[0];
    const maxRent = rents[rents.length - 1];
    const medianRent = rents[Math.floor(rents.length / 2)];

    return NextResponse.json({
      count: similar.length,
      minRent,
      maxRent,
      medianRent,
      properties: similar.map(s => ({
        roomCount: s.roomCount,
        netSqm: s.netSqm,
        rentAmount: s.rentAmount,
        buildingAgeRange: s.buildingAgeRange,
        trustScore: s.trustScore,
      })),
    });

  } catch (error) {
    console.error('Analytics similar error:', error);
    return NextResponse.json({ error: 'Benzer daire verileri yüklenemedi' }, { status: 500 });
  }
}
