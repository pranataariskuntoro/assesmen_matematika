import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import mongoose from 'mongoose';
import { gradeAnswer } from '@/lib/grader';

export async function PATCH(req: Request) {
  try {
    const { sessionId, submissionId, questionId, answer } = await req.json();

    if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json({ success: false, message: 'Invalid submission ID' }, { status: 400 });
    }

    await connectDB();

    const answerDoc = await Answer.findById(submissionId);

    if (!answerDoc || answerDoc.isSubmitted || answerDoc.isTerminated) {
      return NextResponse.json({ success: false, message: 'Cannot modify answer' }, { status: 400 });
    }

    const question = await Question.findById(questionId);
    if (!question) return NextResponse.json({ success: false, message: 'Question not found' }, { status: 404 });

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
    console.error('Save Answer Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
