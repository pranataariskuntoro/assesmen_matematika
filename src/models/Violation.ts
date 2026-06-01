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

// Index untuk query admin (lihat pelanggaran per sesi/siswa)
ViolationSchema.index({ sessionId: 1, studentId: 1 });
ViolationSchema.index({ answerId: 1 });
// TTL: hapus log pelanggaran otomatis setelah 90 hari
ViolationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.models.Violation || mongoose.model<IViolation>('Violation', ViolationSchema);
