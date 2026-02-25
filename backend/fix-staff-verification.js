import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const fixStaffVerification = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all staff accounts to be verified
    const result = await User.updateMany(
      { role: 'staff', isVerified: false },
      { $set: { isVerified: true } }
    );

    console.log(`✅ Updated ${result.modifiedCount} staff accounts to verified`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixStaffVerification();
