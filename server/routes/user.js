import express from "express";
import bcrypt from "bcryptjs";
const router = express.Router();
import { User } from "../models/User.js";
import jwt from 'jsonwebtoken';

import crypto from 'crypto';
import nodemailer from 'nodemailer';
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.json({ message: "User already existed" });
    }
    const hashpassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashpassword,
    });

    await newUser.save();
    return res.json({ status: true, message: "User created successfully" });
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "User is not registered" })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
        return res.json({ message: "Password is incorrect" })
    }

    const token = jwt.sign({ username: user.username }, process.env.KEY, { expiresIn: "1h" })

    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 36000000,
        sameSite: 'Lax'
    })
    return res.json({ status: true, message: "Login successfully" })
})



// Forgot Password Route

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log("Received forgot-password request for:", email);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found with email:", email);
            return res.status(404).json({ message: "User not found" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiration = Date.now() + 3600000;
        user.resetToken = token;
        user.resetTokenExpiration = expiration;
        await user.save();
        console.log("Generated token and saved user:", token);

        const resetLink = `https://ocktivwebsite.vercel.app/reset-password/${token}`;
        console.log("Reset link:", resetLink);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click here to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Failed to send email" });
            } else {
                console.log("Email sent:", info.response);
                return res.status(200).json({ message: "Reset email sent" });
            }
        });

    } catch (err) {
        console.error("🔥 Caught error in forgot-password:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
});


// Reset Password Route
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ status: false, message: "Invalid or expired token." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;

        await user.save();

        return res.json({ status: true, message: "Password has been reset successfully." });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ status: false, message: "Server error. Please try again later." });
    }
});

export { router as userRouter };
