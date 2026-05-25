import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  number: number;
  type: 'matching' | 'multiple_choice' | 'multiple_response' | 'essay';
  subject: string;
  gradeLevel: string;
  questionText: string;
  imageUrl?: string;
  options?: { key: string; text: string }[];
  matchingPairs?: { statement: string; answer: string }[];
  matchingOptions?: string[];
  correctAnswer?: any;
  points: number;
  explanation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  number: { type: Number, required: true },
  type: {
    type: String,
    enum: ['matching', 'multiple_choice', 'multiple_response', 'essay'],
    required: true,
  },
  subject: { type: String, default: 'Matematika' },
  gradeLevel: { type: String, default: 'XI' },
  questionText: { type: String, required: true },
  imageUrl: String,
  options: [{
    key: String,
    text: String,
  }],
  matchingPairs: [{
    statement: String,
    answer: String,
  }],
  matchingOptions: [String],
  correctAnswer: Schema.Types.Mixed,
  points: { type: Number, default: 5 },
  explanation: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
