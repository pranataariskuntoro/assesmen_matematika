import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import mongoose from 'mongoose';
import { gradeAnswer } from '@/lib/grader';

export async function PATCH(req: Request) {
  try {
    const { submissionId, questionId, answer } = await req.json();

    if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json({ success: false, message: 'Invalid submission ID' }, { status: 400 });
    }

    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return NextResponse.json({ success: false, message: 'Invalid question ID' }, { status: 400 });
    }

    await connectDB();

    // Fetch question & submission in parallel — satu round-trip lebih hemat
    const [question, answerDoc] = await Promise.all([
      Question.findById(questionId).select('type number correctAnswer points').lean(),
      Answer.findOne(
        { _id: submissionId, isSubmitted: false, isTerminated: false },
        { 'answers.questionId': 1, isSubmitted: 1, isTerminated: 1 }
      ),
    ]);

    if (!answerDoc) {
      return NextResponse.json({ success: false, message: 'Cannot modify answer' }, { status: 400 });
    }

    if (!question) {
      return NextResponse.json({ success: false, message: 'Question not found' }, { status: 404 });
    }

    const { isCorrect, pointsEarned } = gradeAnswer(question, answer);
    const answeredAt = new Date();

    // Check apakah soal ini sudah pernah dijawab
    const existingIndex = answerDoc.answers.findIndex(
      (a: any) => a.questionId.toString() === questionId
    );

    let updateQuery: any;
    if (existingIndex >= 0) {
      // Update in-place menggunakan positional operator — 1 DB call
      updateQuery = {
        $set: {
          [`answers.${existingIndex}.studentAnswer`]: answer,
          [`answers.${existingIndex}.isCorrect`]: isCorrect,
          [`answers.${existingIndex}.pointsEarned`]: pointsEarned,
          [`answers.${existingIndex}.answeredAt`]: answeredAt,
        },
      };
    } else {
      // Push jawaban baru
      updateQuery = {
        $push: {
          answers: {
            questionId: new mongoose.Types.ObjectId(questionId),
            questionNumber: (question as any).number,
            questionType: (question as any).type,
            studentAnswer: answer,
            isCorrect,
            pointsEarned,
            answeredAt,
          },
        },
      };
    }

    await Answer.updateOne({ _id: submissionId }, updateQuery);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save Answer Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
