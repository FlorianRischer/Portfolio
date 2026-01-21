// Author: Florian Rischer
// Seed Users - Create test user for development
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete existing users (optional - for clean seeding)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create test user
    const testUser = new User({
      email: 'admin@portfolio.com',
      name: 'Admin User',
    });
    testUser.setPassword('password123');
    await testUser.save();

    console.log('✅ Test user created:');
    console.log('   Email: admin@portfolio.com');
    console.log('   Password: password123');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
