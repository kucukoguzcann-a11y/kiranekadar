import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('kira-auth');

    if (!authCookie?.value) {
      return NextResponse.json({ user: null });
    }

    const user = JSON.parse(authCookie.value);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
