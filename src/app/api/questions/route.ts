import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const Question = mongoose.models.Question || mongoose.model('Question');
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    let query = {};
    if (type && type !== 'all') {
      query = { type };
    }

    const questions = await Question.find(query).sort({ number: 1 });
    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    console.error('Questions API Error:', error);
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
    const Question = mongoose.models.Question || mongoose.model('Question');
    
    const body = await req.json();
    
    // Auto-generate number based on latest
    const lastQuestion = await Question.findOne().sort({ number: -1 });
    const nextNumber = lastQuestion ? lastQuestion.number + 1 : 1;
    
    const newQuestion = new Question({
      ...body,
      number: nextNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newQuestion.save();
    return NextResponse.json({ success: true, data: newQuestion }, { status: 201 });
  } catch (error) {
    console.error('Create Question Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
