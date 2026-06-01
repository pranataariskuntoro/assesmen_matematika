import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExamSession from '@/models/ExamSession';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import mongoose from 'mongoose';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { sessionId, submissionId, studentName, studentClass, studentAbsen } = await req.json();

    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const payload = token ? await decrypt(token) : null;
    const studentId = payload?.userId;

    let session;
    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await ExamSession.findById(sessionId).populate('questionIds');
    } else {
      // Find the most recent session if no ID is specified
      session = await ExamSession.findOne().sort({ createdAt: -1 }).populate('questionIds');
    }

    if (!session) {
      return NextResponse.json({ success: false, message: 'Sesi ujian tidak ditemukan' }, { status: 404 });
    }

    let answerDoc = null;

    // 1. If submissionId is provided, find the answer doc
    if (submissionId && mongoose.Types.ObjectId.isValid(submissionId)) {
      answerDoc = await Answer.findById(submissionId);
      if (answerDoc && (answerDoc.isSubmitted || answerDoc.isTerminated || answerDoc.violationCount > 3)) {
        return NextResponse.json({ success: false, redirect: `/result?submissionId=${answerDoc._id}` });
      }
    }

    // 2. If no submissionId but biodata is provided, find or create the answer doc
    if (!answerDoc && studentName && studentClass && studentAbsen) {
      const query: any = {
        sessionId: new mongoose.Types.ObjectId(session._id as string),
      };

      if (studentId) {
        query.studentId = new mongoose.Types.ObjectId(studentId);
      } else {
        query.studentName = studentName.trim();
        query.studentClass = studentClass.trim();
        query.studentAbsen = Number(studentAbsen);
      }

      answerDoc = await Answer.findOne(query);

      if (answerDoc && (answerDoc.isSubmitted || answerDoc.isTerminated || answerDoc.violationCount > 3)) {
        return NextResponse.json({ success: false, redirect: `/result?submissionId=${answerDoc._id}` });
      }

      if (!answerDoc) {
        answerDoc = await Answer.create({
          sessionId: new mongoose.Types.ObjectId(session._id as string),
          studentId: studentId ? new mongoose.Types.ObjectId(studentId) : undefined,
          studentName: studentName.trim(),
          studentClass: studentClass.trim(),
          studentAbsen: Number(studentAbsen),
          answers: [],
          startedAt: new Date(),
        });
      }
    }

    // Prepare safe questions (remove correct answers for student view)
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
      submissionId: answerDoc ? answerDoc._id : null,
      startTime: answerDoc ? answerDoc.startedAt : null,
      questions: safeQuestions,
      existingAnswers: answerDoc ? answerDoc.answers : []
    });

  } catch (error) {
    console.error('Start Exam Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
