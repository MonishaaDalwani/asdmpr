import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error('\nTroubleshooting tips:');
    console.error('1. Make sure your local MongoDB service is running (e.g. net start MongoDB).');
    console.error('2. Or check your MongoDB Atlas connection string in backend/.env.');
    console.error('3. Check network and firewall settings.\n');
    throw error;
  }
};

export default connectDB;
