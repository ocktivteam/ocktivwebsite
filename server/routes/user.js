// routes/user.js

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Certificate } from "../models/Certificate.js"; 
import crypto from "crypto";
import nodemailer from "nodemailer";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
import { checkAdmin } from "../middleware/checkAdmin.js";

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
        newUser.lastLoginAt = new Date();
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

        user.lastLoginAt = new Date();
        await user.save();        

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
router.get("/instructors", jwtMiddleware, checkAdmin, async (req, res) => {
    try {
        const instructors = await User.find({ role: "instructor" }).select("-password -resetToken -resetTokenExpiration");
        res.json({ instructors });
    } catch (err) {
        console.error("Fetch instructors error:", err);
        res.status(500).json({ message: "Failed to fetch instructors" });
    }
});

// DELETE an instructor by ID
router.delete("/instructors/:id", jwtMiddleware, checkAdmin, async (req, res) => {
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

// ================== UPDATE INSTRUCTOR ==================
router.put("/instructors/:id", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const existing = await User.findById(req.params.id);
        if (!existing || existing.role !== "instructor") {
            return res.status(404).json({ status: false, message: "Instructor not found" });
        }

        existing.firstName = firstName || existing.firstName;
        existing.lastName = lastName || existing.lastName;
        existing.email = email || existing.email;

        // Update password only if provided
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            existing.password = hashed;
        }

        await existing.save();

        res.json({ status: true, message: "Instructor updated", instructor: existing });
    } catch (err) {
        console.error("Update instructor error:", err);
        res.status(500).json({ status: false, message: "Failed to update instructor" });
    }
});


// ======================== GET PROFILE ========================
router.get("/profile", jwtMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -resetToken -resetTokenExpiration");
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    res.json({ status: true, user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ status: false, message: "Failed to fetch profile" });
  }
});

// ======================== UPDATE PROFILE ========================
router.put("/profile", jwtMiddleware, async (req, res) => {
  const { firstName, lastName, email, country } = req.body;
  
  try {
    // Check if email is being changed and if it's already taken
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ 
        email: new RegExp('^' + email + '$', 'i'),
        _id: { $ne: req.userId }
      });
      if (existingUser) {
        return res.status(400).json({ status: false, message: "Email already exists" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        country: country.trim()
      },
      { new: true }
    ).select("-password -resetToken -resetTokenExpiration");

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.json({ status: true, message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ status: false, message: "Failed to update profile" });
  }
});

// ======================== CHANGE PASSWORD ========================
router.put("/change-password", jwtMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ status: false, message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ status: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ status: false, message: "Failed to change password" });
  }
});
  
// ========================= UPDATE LEGAL NAME (SELF) =========================
// PATCH /api/users/legal-name
// Body: { legalName }
// Rules:
//  - Cannot change if any certificate exists (Certificate.user = user._id)
//  - Can only change once before certificates (legalNameChangeCount < 1)
router.patch("/legal-name", jwtMiddleware, async (req, res) => {
    try {
      const { legalName } = req.body || {};
      const next = String(legalName || "").trim();
      if (next.length < 2) {
        return res.status(400).json({ status: false, message: "Valid legalName is required" });
      }
  
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ status: false, message: "User not found" });
  
      // No-op if same value (does not consume the one-time allowance)
      const current = String(user.legalName || "").trim();
      if (current.toLowerCase() === next.toLowerCase()) {
        return res.json({
          status: true,
          message: "Legal name unchanged",
          legalName: user.legalName,
          meta: {
            hasAnyCertificate: !!(await Certificate.exists({ user: user._id })),
            remainingLegalNameChanges: Math.max(0, 1 - (user.legalNameChangeCount || 0)),
          }
        });
      }
  
      // Block if any certificate exists
      const hasAnyCertificate = await Certificate.exists({ user: user._id });
      if (hasAnyCertificate) {
        return res.status(403).json({
          status: false,
          message: "Legal name cannot be changed after a certificate is generated. Please contact support."
        });
      }
  
      // Enforce one-time change
      const used = user.legalNameChangeCount || 0;
      if (used >= 1) {
        return res.status(403).json({
          status: false,
          message: "You have already used your one-time legal name change. Please contact support for further changes."
        });
      }
  
      user.legalName = next;
      user.legalNameChangeCount = used + 1;
      await user.save();
  
      return res.json({
        status: true,
        message: "Legal name updated. Heads up: you can’t change it again—contact support if you need a correction.",
        legalName: user.legalName,
        meta: {
          hasAnyCertificate: false,
          remainingLegalNameChanges: Math.max(0, 1 - (user.legalNameChangeCount || 0))
        }
      });
    } catch (err) {
      console.error("PATCH /legal-name error:", err);
      res.status(500).json({ status: false, message: "Server error" });
    }
  });

export { router as userRouter };
