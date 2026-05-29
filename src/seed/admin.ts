import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { loadEnvConfig } from '@next/env';

// Load environment variables
loadEnvConfig(process.cwd());

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_DEFAULT_EMAIL || 'admin@smkn31.sch.id';
const ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// User schema definition for seeding
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected successfully!');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL, role: 'admin' });
    if (existingAdmin) {
      console.log(`Admin user with email ${ADMIN_EMAIL} already exists.`);
      
      // Update password just in case it changed
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin password updated successfully.');
      process.exit(0);
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    console.log('Creating admin user...');
    await User.create({
      name: 'Administrator',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    console.log(`Admin user created successfully!`);
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
