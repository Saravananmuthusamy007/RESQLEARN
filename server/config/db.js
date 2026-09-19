import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/resqlearn';

  try {
    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Warning]: Direct MongoDB connection to primary URI failed (${err.message}).`);
    
    // If remote connection failed and wasn't already local, attempt fallback to local MongoDB
    if (!mongoUri.includes('localhost') && !mongoUri.includes('127.0.0.1')) {
      try {
        console.log(`Attempting fallback connection to local MongoDB (localhost:27017/resqlearn)...`);
        const fallbackConn = await mongoose.connect('mongodb://localhost:27017/resqlearn', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[MongoDB Fallback Connected]: Local MongoDB active at ${fallbackConn.connection.host}/${fallbackConn.connection.name}`);
        return fallbackConn;
      } catch (localErr) {
        console.warn(`[Warning]: Local MongoDB fallback also unavailable (${localErr.message}).`);
      }
    }
    
    console.log(`[Database Notice]: In MongoDB Atlas -> Network Access, ensure IP 0.0.0.0/0 (Allow Anywhere) is whitelisted.`);
    return null;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[MongoDB Disconnected]');
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err.message);
  }
};

export default {
  connectDB,
  disconnectDB,
};
