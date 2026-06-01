import mongoose from 'mongoose';
// Ensure all Mongoose schemas are registered before any .populate() call
import '@/models/index';

declare global {
  var mongoose: { conn: typeof import('mongoose') | null; promise: Promise<typeof import('mongoose')> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('MONGODB_URI tidak ditemukan di .env.local');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 20,            // handle 210 siswa bersamaan
      minPoolSize: 5,             // keep minimum connections warm
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
