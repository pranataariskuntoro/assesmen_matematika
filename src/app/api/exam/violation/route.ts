import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Violation from '@/models/Violation';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const { sessionId, submissionId, type, count } = await req.json();

    if (!sessionId || !type || !submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    await connectDB();

    const maxViolations = Number(process.env.MAX_VIOLATIONS || 3);
    
    // Find answer record
    const answer = await Answer.findById(submissionId);

    if (!answer) {
      return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
    }

    // Insert violation
    await Violation.create({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      answerId: answer._id,
      type,
      count,
      userAgent: req.headers.get('user-agent') || 'Unknown',
    });

    // Update violation count
    answer.violationCount += 1;
    let terminated = false;

    if (answer.violationCount > maxViolations) {
      answer.isTerminated = true;
      answer.isSubmitted = true;
      answer.submittedAt = new Date();
      terminated = true;
    }

    await answer.save();

    return NextResponse.json({
      success: true,
      terminated,
      violationCount: answer.violationCount,
      remaining: Math.max(0, maxViolations - answer.violationCount),
    });

  } catch (error) {
    console.error('Violation Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
