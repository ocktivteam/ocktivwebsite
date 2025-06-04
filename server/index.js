import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { userRouter } from "./routes/user.js";

dotenv.config();

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
console.log("Loaded PORT:", process.env.PORT);

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://ocktivwebsite.vercel.app",
  "https://ocktivwebsite-3.onrender.com"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


app.get('/ping', (req, res) => res.json({ pong: true, origin: req.headers.origin }));


app.use('/auth', userRouter);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
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
