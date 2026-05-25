import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  nisn?: string;
  email?: string;
  password?: string;
  role: 'student' | 'admin';
  class?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  nisn: { type: String, unique: true, sparse: true },  // untuk siswa
  email: { type: String, unique: true, sparse: true }, // untuk admin
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  class: String,        // e.g. "XI TKJ 1"
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
