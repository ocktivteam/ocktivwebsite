// routes/user.js

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();

// ======================== SIGN UP ========================
router.post("/signup", async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    const userRole = role || "student";

    try {
        // Prevent duplicate email
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ status: false, message: "User already exists" });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashed,
            role: userRole,
        });
        await newUser.save();

        // Create JWT
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.firstName, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Respond with token & user object (without password)
        res.json({
            status: true,
            message: "User created successfully",
            token,
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ status: false, message: "Server error during registration" });
    }
});

// ======================== LOGIN ========================
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: false, message: "User is not registered" });
        }

        // Validate password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ status: false, message: "Password is incorrect" });
        }

        // Create JWT
        const token = jwt.sign(
            { userId: user._id, username: user.firstName, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Respond with token & user object (without password)
        res.json({
            status: true,
            message: "Login successfully",
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ status: false, message: "Server error during login" });
    }
});

// ==================== FORGOT PASSWORD ===================
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Always respond positively for privacy
            return res.status(200).json({ message: "If this email is registered, a reset link has been sent. Please check inbox or spam folder" });
        }
        const token = crypto.randomBytes(32).toString("hex");
        const expiration = Date.now() + 3600000; // 1 hour
        user.resetToken = token;
        user.resetTokenExpiration = expiration;
        await user.save();

        const resetLink = `https://ocktivwebsite.vercel.app/reset-password/${token}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset Request",
            html: `<p>Click here to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Failed to send email" });
            } else {
                console.log("Email sent:", info.response);
                return res.status(200).json({ message: "If this email is registered, a reset link has been sent." });
            }
        });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// ==================== RESET PASSWORD ====================
router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ status: false, message: "Invalid or expired token." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();
        res.json({ status: true, message: "Password has been reset successfully." });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ status: false, message: "Server error. Please try again later." });
    }
});

export { router as userRouter };
