import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswerItem {
  questionId: mongoose.Types.ObjectId;
  questionNumber: number;
  questionType: string;
  studentAnswer?: any;
  isCorrect?: boolean;
  pointsEarned?: number;
  answeredAt?: Date;
}

export interface IAnswer extends Document {
  studentId?: mongoose.Types.ObjectId;
  studentName: string;
  studentClass: string;
  studentAbsen: number;
  sessionId: mongoose.Types.ObjectId;
  answers: IAnswerItem[];
  totalScore: number;
  maxScore?: number;
  percentageScore?: number;
  grade?: string;
  startedAt: Date;
  submittedAt?: Date;
  isSubmitted: boolean;
  isTerminated: boolean;
  timeSpent?: number;
  violationCount: number;
}

const AnswerSchema = new Schema<IAnswer>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  studentName: { type: String, required: true },
  studentClass: { type: String, required: true },
  studentAbsen: { type: Number, required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'ExamSession', required: true },
  answers: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    questionNumber: Number,
    questionType: String,
    studentAnswer: Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number,
    answeredAt: Date,
  }],
  totalScore: { type: Number, default: 0 },
  maxScore: Number,
  percentageScore: Number,
  grade: String,
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  isSubmitted: { type: Boolean, default: false },
  isTerminated: { type: Boolean, default: false },
  timeSpent: Number,
  violationCount: { type: Number, default: 0 },
});

// Index untuk mempercepat query yang paling sering dipanggil
// saat 210 siswa bersamaan:
// 1. findOne({ _id, isSubmitted: false, isTerminated: false }) — auto-save
// 2. findOne({ studentId, sessionId }) — cek duplikasi saat start
// 3. findOne({ sessionId }) — admin lihat hasil per sesi
AnswerSchema.index({ sessionId: 1, isSubmitted: 1, isTerminated: 1 });
AnswerSchema.index(
  { studentId: 1, sessionId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { studentId: { $exists: true, $ne: null } } 
  }
);
AnswerSchema.index({ studentName: 1, sessionId: 1 });
AnswerSchema.index({ submittedAt: -1 });

export default mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema);
