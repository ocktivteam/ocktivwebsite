//models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    //required: true,
    default: 'student',  // Default value is 'student'
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null, // This makes it optional as it'll default to null
  },

  //Payment / Certificate Fields
  legalName: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },

  legalNameChangeCount: { type: Number, default: 0 },

  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiration: {
    type: Date,
    default: null,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

const UserModel = mongoose.model("User", userSchema);
export { UserModel as User };
