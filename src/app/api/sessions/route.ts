import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExamSession from '@/models/ExamSession';
import Question from '@/models/Question';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const sessions = await ExamSession.find().populate('questionIds').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Get Sessions Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const newSession = new ExamSession({
      ...body,
      createdBy: auth.userId,
      createdAt: new Date(),
    });

    await newSession.save();
    return NextResponse.json({ success: true, data: newSession }, { status: 201 });
  } catch (error) {
    console.error('Create Session Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
