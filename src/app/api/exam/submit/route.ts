import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import ExamSession from '@/models/ExamSession';
import Question from '@/models/Question';
import mongoose from 'mongoose';
import { calculateGrade } from '@/lib/grader';

export async function POST(req: Request) {
  try {
    const { sessionId, submissionId, forceSubmit } = await req.json();

    if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json({ success: false, message: 'Invalid submission ID' }, { status: 400 });
    }

    await connectDB();

    const answerDoc = await Answer.findById(submissionId);

    if (!answerDoc) return NextResponse.json({ success: false, message: 'Answer document not found' }, { status: 404 });

    if (answerDoc.isSubmitted && !forceSubmit) {
      return NextResponse.json({ success: true, message: 'Already submitted' });
    }

    const session = await ExamSession.findById(sessionId);
    if (!session) return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });

    // Calculate total score
    let totalScore = 0;
    answerDoc.answers.forEach((ans: any) => {
      totalScore += (ans.pointsEarned || 0);
    });

    // Fetch all questions in this session to calculate maxPossiblePoints dynamically based on our rules
    const Question = mongoose.models.Question || mongoose.model('Question');
    const questions = await Question.find({ _id: { $in: session.questionIds } });
    let maxPossiblePoints = 0;
    questions.forEach((q: any) => {
      if (q.type === 'matching') {
        maxPossiblePoints += 8; // 8 matches
      } else if (q.type === 'multiple_choice' || q.type === 'multiple_response') {
        maxPossiblePoints += 1; // 1 point per choice/response question
      }
      // essay gets 0 points for automatic grading
    });
    
    answerDoc.totalScore = totalScore;
    answerDoc.maxScore = maxPossiblePoints;
    answerDoc.percentageScore = maxPossiblePoints > 0 ? (totalScore / maxPossiblePoints) * 100 : 0;
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
    console.error('Submit Exam Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
