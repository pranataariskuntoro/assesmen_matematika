import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import { verifyAuth } from '@/lib/auth';
import { calculateGrade } from '@/lib/grader';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await Answer.findById(id)
      .populate('sessionId')
      .populate('answers.questionId');

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Get Result Detail Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { questionId, pointsEarned } = await req.json();

    const answerDoc = await Answer.findById(id);
    if (!answerDoc) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    const ansIndex = answerDoc.answers.findIndex((a: any) => a.questionId.toString() === questionId);
    if (ansIndex === -1) {
      return NextResponse.json({ error: 'Question not found in student answers' }, { status: 404 });
    }

    // Update essay points
    answerDoc.answers[ansIndex].pointsEarned = Number(pointsEarned);
    answerDoc.answers[ansIndex].isCorrect = Number(pointsEarned) > 0;
    answerDoc.answers[ansIndex].answeredAt = new Date();

    // Recalculate total score
    let totalScore = 0;
    answerDoc.answers.forEach((ans: any) => {
      totalScore += (ans.pointsEarned || 0);
    });

    const maxScore = answerDoc.maxScore || 100;
    answerDoc.totalScore = totalScore;
    answerDoc.percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    answerDoc.grade = calculateGrade(answerDoc.percentageScore);

    await answerDoc.save();

    return NextResponse.json({ success: true, data: answerDoc });
  } catch (error) {
    console.error('Grade Essay Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
