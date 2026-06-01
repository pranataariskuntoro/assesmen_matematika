import mongoose, { Schema, Document } from 'mongoose';

export interface IExamSession extends Document {
  name: string;
  subject?: string;
  startTime?: Date;
  endTime?: Date;
  duration: number;
  questionIds: mongoose.Types.ObjectId[];
  allowedClasses: string[];
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ExamSessionSchema = new Schema<IExamSession>({
  name: { type: String, required: true },
  subject: String,
  startTime: Date,
  endTime: Date,
  duration: { type: Number, default: 90 },
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  allowedClasses: [String],
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ExamSession || mongoose.model<IExamSession>('ExamSession', ExamSessionSchema);
