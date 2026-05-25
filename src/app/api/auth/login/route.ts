import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identity, password, role } = body;

    if (!identity || !password || !role) {
      return NextResponse.json({ success: false, message: 'Harap lengkapi semua field' }, { status: 400 });
    }

    await connectDB();

    let user;
    if (role === 'student') {
      user = await User.findOne({ nisn: identity, role: 'student' });
    } else if (role === 'admin') {
      user = await User.findOne({ email: identity, role: 'admin' });
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'Akun tidak ditemukan' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
    }

    const payload = { userId: user._id.toString(), role: user.role, name: user.name };
    const token = await encrypt(payload);

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true, user: { name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
