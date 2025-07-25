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
        // Prevent duplicate email (case-insensitive search!)
        const existing = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        if (existing) {
            return res.status(400).json({ status: false, message: "User already exists" });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create user (store as entered, don't lower)
        const newUser = new User({
            firstName,
            lastName,
            email, // Store as typed (original casing)
            password: hashed,
            role: userRole
        });
        await newUser.save();

        // Create JWT
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.firstName, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

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
        // Find user by email (case-insensitive)
        const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
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
        // Case-insensitive search for user
        const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        if (!user) {
            // Always respond positively for privacy
            return res.status(200).json({ message: "If this email is registered, a reset link has been sent. Please check inbox or spam folder." });
        }
        const token = crypto.randomBytes(32).toString("hex");
        const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        user.resetToken = token;
        user.resetTokenExpiration = expiration;
        await user.save();

        const resetLink = `https://ocktivwebsite.vercel.app/reset-password/${token}`;

        // Use first and last name if available
        let fullName = "User";
        if (user.firstName && user.lastName) {
            fullName = `${user.firstName} ${user.lastName}`;
        } else if (user.firstName) {
            fullName = user.firstName;
        } else if (user.lastName) {
            fullName = user.lastName;
        }

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
            html: `
                <p>
                    Hello ${fullName},<br><br>
                    You have requested to reset your password. Please click the link below to proceed.<br>
                    <b>This link will expire in 15 minutes for your security.</b><br><br>
                    <a href="${resetLink}">${resetLink}</a><br><br>
                    If you did not request this change, please disregard this email.<br><br>
                    Sincerely,<br>
                    The Ocktiv Team
                </p>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Failed to send email" });
            } else {
                console.log("Email sent:", info.response);
                return res.status(200).json({ message: "If this email is registered, a reset link has been sent. Please check your inbox or spam folder." });
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

// ======================== REFRESH TOKEN ========================
router.post("/refresh-token", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token format error" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        const user = await User.findById(payload.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newToken = jwt.sign(
            { userId: user._id, username: user.firstName, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token: newToken });
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});


// ======================== GET INSTRUCTORS ========================
router.get("/instructors", async (req, res) => {
    try {
        const instructors = await User.find({ role: "instructor" }).select("-password -resetToken -resetTokenExpiration");
        res.json({ instructors });
    } catch (err) {
        console.error("Fetch instructors error:", err);
        res.status(500).json({ message: "Failed to fetch instructors" });
    }
});


// DELETE an instructor by ID
router.delete("/instructors/:id", async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ status: false, message: "Instructor not found" });
      res.json({ status: true, message: "Instructor deleted" });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
  

// ================== UPDATE LEGAL NAME & COUNTRY AFTER PAYMENT ==================
router.patch("/:id/legal-country", async (req, res) => {
    const { legalName, country } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { legalName, country },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        res.json({ status: true, message: "Legal name and country updated", user });
    } catch (err) {
        res.status(500).json({ status: false, message: "Error updating info" });
    }
});

export { router as userRouter };
