import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    return NextResponse.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Logout gagal' }, { status: 500 });
  }
}
