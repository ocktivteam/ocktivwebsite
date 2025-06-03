/*import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
import { userRouter } from './routes/user.js';

const app = express();
app.use(express.json());
app.use(cors({
  origin: "https://ocktivwebsite.vercel.app",
  credentials: true,
}))
app.use(cookieParser())
app.use('/auth', userRouter)

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

*/

// Allow both local development (http://localhost:3000) and production (https://ocktivwebsite.vercel.app) to access the backend
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
import { userRouter } from './routes/user.js';

const app = express();
app.use(express.json());

// Enable CORS for both local development and production environments
const allowedOrigins = [
  'http://localhost:3000', // Local development URL
  'https://ocktivwebsite.vercel.app' // Production URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from localhost and production URLs
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request if origin is not allowed
    }
  },
  credentials: true, // Allow cookies or other credentials if needed
}));

app.use(cookieParser());
app.use('/auth', userRouter);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
