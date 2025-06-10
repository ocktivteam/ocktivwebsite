import express from "express";
import { enrollUser } from "../controllers/enrollController.js";

const router = express.Router();

router.post("/enroll", enrollUser);

export { router as enrollRouter };
