// index.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
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
import { preventCache } from "./middleware/preventCache.js";
import { emailRouter } from "./routes/emailRoutes.js";
import discussionRouter from "./routes/discussionRoutes.js";

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

app.use("/api/discussions", preventCache, discussionRouter);
app.use("/api/enrollment", preventCache, enrollRouter);
app.use("/api/courses", preventCache, courseRouter);
app.use("/api/modules", preventCache, moduleRouter);
app.use("/api/module-progress", preventCache, moduleProgressRouter);
app.use("/api/upload", uploadRoutes);
app.use("/api/download", downloadRouter);
app.use("/api/quiz", preventCache, quizRouter);
app.use("/api/certificate", preventCache, certificateRouter);
console.log("Hitting Email route")
console.log("emailRouter value is:", emailRouter);
app.use("/api/email", emailRouter);
console.log("hit email")

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
