// index.js

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { userRouter } from "./routes/user.js";
import { enrollRouter } from "./routes/enrollRoutes.js";
import { courseRouter } from "./routes/courseRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://ocktivwebsite.vercel.app",
  "https://ocktivwebsite-3.onrender.com"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed from this origin: ' + origin), false);
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/ping', (req, res) => res.json({ pong: true, origin: req.headers.origin }));

app.use('/auth', userRouter);


app.use("/api/enrollment", enrollRouter);

app.use("/api/courses", courseRouter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
