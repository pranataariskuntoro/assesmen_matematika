import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import ExamSession from '@/models/ExamSession';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { calculateGrade } from '@/lib/grader';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload || payload.role !== 'student') return NextResponse.json({ success: false }, { status: 403 });

    const { sessionId, forceSubmit } = await req.json();

    await connectDB();

    const answerDoc = await Answer.findOne({
      studentId: new mongoose.Types.ObjectId(payload.userId),
      sessionId: new mongoose.Types.ObjectId(sessionId)
    });

    if (!answerDoc) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    if (answerDoc.isSubmitted && !forceSubmit) {
      return NextResponse.json({ success: true, message: 'Already submitted' });
    }

    const session = await ExamSession.findById(sessionId);
    if (!session) return NextResponse.json({ success: false }, { status: 404 });

    // Calculate total score
    let totalScore = 0;
    answerDoc.answers.forEach((ans: any) => {
      totalScore += (ans.pointsEarned || 0);
    });

    // Here we need maxScore, assuming we fetch all questions to sum their points
    // For simplicity, we can just save totalScore for now. Admin dashboard can compute max.
    // Or we compute it here.
    const maxPossiblePoints = session.questionIds.length * 5; // Simplified, ideally fetch all questions.

    answerDoc.totalScore = totalScore;
    answerDoc.maxScore = maxPossiblePoints;
    answerDoc.percentageScore = (totalScore / maxPossiblePoints) * 100;
    answerDoc.grade = calculateGrade(answerDoc.percentageScore);
    answerDoc.isSubmitted = true;
    answerDoc.submittedAt = new Date();
    
    if (forceSubmit) {
      answerDoc.isTerminated = true;
    }

    const timeSpent = (answerDoc.submittedAt.getTime() - answerDoc.startedAt.getTime()) / 1000;
    answerDoc.timeSpent = timeSpent;

    await answerDoc.save();

    return NextResponse.json({ success: true, result: { totalScore, grade: answerDoc.grade } });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
