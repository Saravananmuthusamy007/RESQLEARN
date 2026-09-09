const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const levelRoutes = require('./routes/levels');
const practicalRoutes = require('./routes/practical');
const mcqRoutes = require('./routes/mcq');
const adminRoutes = require('./routes/admin');
const certificateRoutes = require('./routes/certificate');
const feedbackRoutes = require('./routes/feedback');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/practical', practicalRoutes);
app.use('/api/mcq', mcqRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/first-aid-system';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
