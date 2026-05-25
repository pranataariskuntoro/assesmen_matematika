import mongoose, { Schema, Document } from 'mongoose';

export interface IViolation extends Document {
  studentId?: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  answerId?: mongoose.Types.ObjectId;
  type: 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'copy_paste' | 'right_click';
  count: number;
  timestamp: Date;
  userAgent?: string;
}

const ViolationSchema = new Schema<IViolation>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: Schema.Types.ObjectId, ref: 'ExamSession' },
  answerId: { type: Schema.Types.ObjectId, ref: 'Answer' },
  type: {
    type: String,
    enum: ['tab_switch', 'window_blur', 'fullscreen_exit', 'copy_paste', 'right_click'],
  },
  count: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now },
  userAgent: String,
});

export default mongoose.models.Violation || mongoose.model<IViolation>('Violation', ViolationSchema);
