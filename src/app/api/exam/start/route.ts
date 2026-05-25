import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExamSession from '@/models/ExamSession';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload || payload.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { sessionId } = await req.json();

    await connectDB();

    const session = await ExamSession.findById(sessionId).populate('questionIds');
    if (!session || !session.isActive) {
      return NextResponse.json({ success: false, message: 'Ujian tidak tersedia' }, { status: 404 });
    }

    let answerDoc = await Answer.findOne({
      studentId: new mongoose.Types.ObjectId(payload.userId),
      sessionId: new mongoose.Types.ObjectId(sessionId)
    });

    if (answerDoc && answerDoc.isSubmitted) {
      return NextResponse.json({ success: false, redirect: '/result' });
    }

    if (!answerDoc) {
      answerDoc = await Answer.create({
        studentId: new mongoose.Types.ObjectId(payload.userId),
        sessionId: new mongoose.Types.ObjectId(sessionId),
        answers: [],
        startedAt: new Date(),
      });
    }

    // Shuffle questions or just return
    // Remove correct answers before sending
    const safeQuestions = session.questionIds.map((q: any) => ({
      _id: q._id,
      number: q.number,
      type: q.type,
      subject: q.subject,
      questionText: q.questionText,
      imageUrl: q.imageUrl,
      options: q.options,
      matchingPairs: q.matchingPairs ? q.matchingPairs.map((p: any) => ({ statement: p.statement })) : [],
      matchingOptions: q.matchingOptions,
      points: q.points,
    }));

    return NextResponse.json({
      success: true,
      sessionId: session._id,
      duration: session.duration,
      startTime: answerDoc.startedAt,
      questions: safeQuestions,
      existingAnswers: answerDoc.answers
    });
  } catch (error) {
    console.error('Start Exam Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
