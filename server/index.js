// index.js

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import compression from "compression"; 
import { userRouter } from "./routes/user.js";
import { enrollRouter } from "./routes/enrollRoutes.js";
import { courseRouter } from "./routes/courseRoutes.js";
import moduleRouter from "./routes/moduleRoutes.js";
import moduleProgressRouter from "./routes/moduleProgressRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import downloadRouter from "./routes/download.js";
import quizRouter from "./routes/quizRoutes.js";
import certificateRouter from "./routes/certificate.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://ocktivwebsite.vercel.app",
  "https://ocktivwebsite-3.onrender.com"
];

app.use(compression());

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

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());

app.get('/ping', (req, res) => res.json({ pong: true, origin: req.headers.origin }));

app.use('/auth', userRouter);

app.use("/api/enrollment", enrollRouter);

app.use("/api/courses", courseRouter);

app.use("/api/modules", moduleRouter);

app.use("/api/module-progress", moduleProgressRouter);

app.use("/api/upload", uploadRoutes);

app.use("/api/download", downloadRouter);

app.use("/api/quiz", quizRouter);

app.use("/api/certificate", certificateRouter);

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
