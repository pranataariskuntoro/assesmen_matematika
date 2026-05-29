import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId');

    if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json({ success: false, message: 'ID submission tidak valid' }, { status: 400 });
    }

    await connectDB();
    const answerDoc = await Answer.findById(submissionId);

    if (!answerDoc) {
      return NextResponse.json({ success: false, message: 'Data submission tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        studentName: answerDoc.studentName,
        studentClass: answerDoc.studentClass,
        studentAbsen: answerDoc.studentAbsen,
        isSubmitted: answerDoc.isSubmitted,
        isTerminated: answerDoc.isTerminated,
        violationCount: answerDoc.violationCount,
      }
    });

  } catch (error) {
    console.error('Fetch Result Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
