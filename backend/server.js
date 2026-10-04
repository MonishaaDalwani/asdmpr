import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(` Hospital Management System API Server Running `);
      console.log(` Port: ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error(`Failed to start server due to database connection error:`, error.message);
    process.exit(1);
  }
};

startServer();
