import { beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongoServer;

beforeAll(async () => {
  let mongoUri = process.env.TEST_MONGO_URI || process.env.MONGO_URI;

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
  } catch (err) {
    // If MongoMemoryServer fails to download binary, fallback to test DB URI
    if (!mongoUri || !mongoUri.includes('_test')) {
      mongoUri = 'mongodb://127.0.0.1:27017/hospital_management_test';
    }
  }

  process.env.JWT_SECRET = 'test_secret_jwt_key_hospital_management';
  process.env.MONGO_URI = mongoUri;

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
