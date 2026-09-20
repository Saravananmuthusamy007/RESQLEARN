import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

async function testRoutes() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri, { dbName: 'resqlearn' });

  // 1. Health check
  const healthRes = await fetch('http://127.0.0.1:5000/api/health');
  const healthData = await healthRes.json();
  console.log('Health check:', healthData.status);

  // 2. Find learner and admin users
  const learner = await User.findOne({ role: 'learner' });
  const admin = await User.findOne({ role: 'admin' });

  if (!learner || !admin) {
    console.error('Missing learner or admin user in database');
    process.exit(1);
  }

  const learnerToken = jwt.sign(
    { id: learner._id, role: learner.role },
    process.env.JWT_SECRET || 'resqlearn_super_secret_jwt_key_2026',
    { expiresIn: '1h' }
  );

  const adminToken = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET || 'resqlearn_super_secret_jwt_key_2026',
    { expiresIn: '1h' }
  );

  // 3. Test Learner AI endpoint with greeting & clinical question
  console.log('\n--- 3. Testing Learner AI: "hii" ---');
  const learnerHiiRes = await fetch('http://127.0.0.1:5000/api/learning-partner/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${learnerToken}` },
    body: JSON.stringify({ message: 'hii', levelId: 'level1', conversationHistory: [] })
  });
  console.log('Learner "hii":', await learnerHiiRes.json());

  console.log('\n--- 4. Testing Learner AI: "What is CPR depth?" ---');
  const learnerDepthRes = await fetch('http://127.0.0.1:5000/api/learning-partner/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${learnerToken}` },
    body: JSON.stringify({ message: 'What is the correct CPR compression depth and why?', levelId: 'level1', conversationHistory: [] })
  });
  console.log('Learner CPR depth:', await learnerDepthRes.json());

  // 5. Test Admin AI endpoint with "hii" and "how are you?" from user screenshot
  console.log('\n--- 5. Testing Admin AI: "hii" ---');
  const adminHiiRes = await fetch('http://127.0.0.1:5000/api/admin/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ message: 'hii', conversationHistory: [] })
  });
  console.log('Admin "hii":', await adminHiiRes.json());

  console.log('\n--- 6. Testing Admin AI: "how are you?" ---');
  const adminHowRes = await fetch('http://127.0.0.1:5000/api/admin/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ message: 'how are you?', conversationHistory: [] })
  });
  console.log('Admin "how are you?":', await adminHowRes.json());

  console.log('\n--- 7. Testing Admin AI: "How many learners are registered?" ---');
  const adminLearnersRes = await fetch('http://127.0.0.1:5000/api/admin/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ message: 'How many learners are registered?', conversationHistory: [] })
  });
  console.log('Admin Learners query:', await adminLearnersRes.json());

  await mongoose.disconnect();
}

testRoutes().catch(err => {
  console.error('HTTP test error:', err);
  process.exit(1);
});
