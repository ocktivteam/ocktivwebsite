import express from "express";
import bcrypt from "bcryptjs";
const router = express.Router();
import { User } from "../models/User.js";
import jwt from 'jsonwebtoken';

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
export { router as userRouter };
