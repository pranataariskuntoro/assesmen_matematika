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

    // Atomic increment — 1 DB call, tidak perlu load seluruh dokumen
    const updated = await Answer.findOneAndUpdate(
      { _id: submissionId, isSubmitted: false, isTerminated: false },
      { $inc: { violationCount: 1 } },
      { new: true, select: 'violationCount studentId sessionId' }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Submission not found or already closed' }, { status: 404 });
    }

    const newCount = updated.violationCount;
    const terminated = newCount > maxViolations;

    // Log violation dan handle terminasi secara paralel
    const tasks: Promise<any>[] = [
      Violation.create({
        studentId: updated.studentId,
        sessionId: new mongoose.Types.ObjectId(sessionId),
        answerId: updated._id,
        type,
        count,
        userAgent: req.headers.get('user-agent') || 'Unknown',
      }),
    ];

    if (terminated) {
      tasks.push(
        Answer.updateOne(
          { _id: submissionId },
          {
            $set: {
              isTerminated: true,
              isSubmitted: true,
              submittedAt: new Date(),
            },
          }
        )
      );
    }

    await Promise.all(tasks);

    return NextResponse.json({
      success: true,
      terminated,
      violationCount: newCount,
      remaining: Math.max(0, maxViolations - newCount),
    });

  } catch (error) {
    console.error('Violation Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
