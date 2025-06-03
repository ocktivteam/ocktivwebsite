
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   resetToken: {
//     type: String, // Token for password reset
//     default: null,
//   },
//   resetTokenExpiration: {
//     type: Date, // Expiry time for the reset token
//     default: null,
//   },
// });

// const UserModel = mongoose.model("User", userSchema);

// export { UserModel as User }


/// new model

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
  roles: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null,
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiration: {
    type: Date,
    default: null,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

const UserModel = mongoose.model("User", userSchema);
export { UserModel as User };
