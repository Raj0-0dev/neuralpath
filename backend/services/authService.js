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
  throw new Error("authenticateUser not implemented.");
};

export const verifyGoogleToken = async (googleToken) => {
  throw new Error("verifyGoogleToken not implemented.");
};

export const generateToken = (user) => {
  throw new Error("generateToken not implemented.");
};
