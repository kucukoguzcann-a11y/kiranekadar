import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // In production, this would create a Supabase user and DB record
    // For demo, just return success
    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Kayıt başarılı',
      user: { email, name: name || null, role: 'user' },
    });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
