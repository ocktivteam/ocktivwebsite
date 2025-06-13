import express from "express";
import { enrollUser, getUserEnrollments } from "../controllers/enrollController.js";
const router = express.Router();

router.post("/enroll", enrollUser);

router.get("/user/:userId", getUserEnrollments);

export { router as enrollRouter };
