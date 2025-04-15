import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
import { userRouter } from './routes/user.js';


const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
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

