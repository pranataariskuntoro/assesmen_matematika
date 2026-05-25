import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { gradeAnswer } from '@/lib/grader';

export async function PATCH(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload || payload.role !== 'student') return NextResponse.json({ success: false }, { status: 403 });

    const { sessionId, questionId, answer } = await req.json();

    await connectDB();

    const answerDoc = await Answer.findOne({
      studentId: new mongoose.Types.ObjectId(payload.userId),
      sessionId: new mongoose.Types.ObjectId(sessionId)
    });

    if (!answerDoc || answerDoc.isSubmitted || answerDoc.isTerminated) {
      return NextResponse.json({ success: false, message: 'Cannot modify answer' }, { status: 400 });
    }

    const question = await Question.findById(questionId);
    if (!question) return NextResponse.json({ success: false }, { status: 404 });

    const existingAnsIndex = answerDoc.answers.findIndex((a: any) => a.questionId.toString() === questionId);
    
    // Auto-grade immediately if possible
    const { isCorrect, pointsEarned } = gradeAnswer(question, answer);

    if (existingAnsIndex >= 0) {
      answerDoc.answers[existingAnsIndex].studentAnswer = answer;
      answerDoc.answers[existingAnsIndex].isCorrect = isCorrect;
      answerDoc.answers[existingAnsIndex].pointsEarned = pointsEarned;
      answerDoc.answers[existingAnsIndex].answeredAt = new Date();
    } else {
      answerDoc.answers.push({
        questionId: question._id,
        questionNumber: question.number,
        questionType: question.type,
        studentAnswer: answer,
        isCorrect,
        pointsEarned,
        answeredAt: new Date()
      });
    }

    await answerDoc.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
