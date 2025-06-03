import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { userRouter } from "./routes/user.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://ocktivwebsite.vercel.app"
];

// --- CORS MIDDLEWARE MUST BE AT THE TOP! ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// --- Body parser and cookies ---
app.use(express.json());
app.use(cookieParser());

// --- PING TEST ROUTE ---
app.get('/ping', (req, res) => res.json({ pong: true, origin: req.headers.origin }));

// --- AUTH ROUTES ---
app.use('/auth', userRouter);

// --- CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// --- START SERVER ---
app.listen(5050, () => {
  console.log("Server running on port 5050");
});
