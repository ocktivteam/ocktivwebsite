
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
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
  resetToken: {
    type: String, // Token for password reset
    default: null,
  },
  resetTokenExpiration: {
    type: Date, // Expiry time for the reset token
    default: null,
  },
});

const UserModel = mongoose.model("User", userSchema);

export { UserModel as User }