const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function migrateThresholds() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const levelSchema = new mongoose.Schema({
      title: String,
      order: Number,
      practicalThreshold: Number,
      mcqThreshold: Number
    }, { strict: false });

    const Level = mongoose.model('Level', levelSchema);

    const updateRes = await Level.updateMany(
      { practicalThreshold: { $ne: 75 } },
      { $set: { practicalThreshold: 75 } }
    );
    console.log('Migration Result:', updateRes);

    const allLevels = await Level.find({}).sort({ order: 1 });
    console.log('Verified levels in database:');
    allLevels.forEach(l => {
      console.log(`Level ${l.order} (${l.title}): practicalThreshold = ${l.practicalThreshold}%, mcqThreshold = ${l.mcqThreshold}%`);
    });

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateThresholds();
