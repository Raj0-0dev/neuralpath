import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async (userData) => {
  const { email, password, role, name } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = new User({
    email,
    password,
    role: role || "employee",
    name: name || email.split("@")[0],
  });

  await user.save();
  return user;
};

export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
};

export const verifyGoogleToken = async (googleToken) => {
  throw new Error("verifyGoogleToken not implemented.");
};

export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "default_secret_key";
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    secret,
    { expiresIn: "1d" }
  );
};
