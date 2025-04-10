import express from "express";
import bcrypt from "bcryptjs";
const router = express.Router();
import { User } from "../models/User.js";
import jwt from 'jsonwebtoken';
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

// Forgot password route
router.post("/forgotPassword", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.json({ status: false, message: "User with this email does not exist." });


        const token = crypto.randomBytes(32).toString("hex");

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();

        const resetLink = `http://localhost:3000/reset-password/${token}`;


        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            to: user.email,
            subject: "Password Reset Request",
            html: `
          <p>Hi ${user.username},</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link is valid for 1 hour.</p>
        `,
        });

        res.json({ status: true, message: "Password reset link sent to your email." });
    } catch (err) {
        console.error("Error in forgot-password:", err);
        res.status(500).json({ status: false, message: "Server error. Try again later." });
    }
});

export { router as userRouter };
