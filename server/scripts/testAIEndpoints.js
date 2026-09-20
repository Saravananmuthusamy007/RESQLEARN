import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Level from '../models/Level.js';
import { getComprehensivePlatformAnalytics } from '../ai/adminAnalyticsService.js';
import { chatWithLearnerAI, chatWithAdminAI } from '../ai/geminiService.js';

dotenv.config();

async function test() {
  console.log('Connecting to DB...');
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri, { dbName: 'resqlearn' });
  console.log('Connected to DB successfully.');

  // 1. Test adminAnalyticsService
  console.log('\n--- Testing adminAnalyticsService ---');
  const analytics = await getComprehensivePlatformAnalytics();
  console.log('Total learners:', analytics.users.totalLearners);
  console.log('Total admins:', analytics.users.totalAdmins);
  console.log('Level completion stats:', JSON.stringify(analytics.levelCompletion.levelStats));
  console.log('Certificates issued:', analytics.certifications.totalCertificatesIssued);

  // 2. Test Learner AI Service
  console.log('\n--- Testing chatWithLearnerAI ---');
  const level1 = await Level.findOne({ levelNumber: 1 });
  const learnerReply = await chatWithLearnerAI({
    message: 'What is the correct compression depth for adult CPR, and why?',
    conversationHistory: [],
    levelContext: level1 ? level1.toObject() : {},
    learnerPerformance: { practicalScore: 85, mistakes: 1, weakAreas: ['Compression depth'] }
  });
  console.log('Learner AI Source:', learnerReply.source);
  console.log('Learner AI Reply Sample:', learnerReply.reply.slice(0, 180) + '...');

  // 3. Test Admin AI Service
  console.log('\n--- Testing chatWithAdminAI ---');
  const adminReply = await chatWithAdminAI({
    message: 'How many learners are currently registered and how many completed Level 1?',
    conversationHistory: [],
    analyticsData: analytics
  });
  console.log('Admin AI Source:', adminReply.source);
  console.log('Admin AI Reply Sample:', adminReply.reply.slice(0, 180) + '...');

  await mongoose.disconnect();
  console.log('\nTest completed successfully!');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
