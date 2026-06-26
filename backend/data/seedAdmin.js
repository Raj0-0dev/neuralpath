import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error("MONGODB_URI environment variable is not defined in the backend .env file.");
    }

    console.log("Connecting to MongoDB for admin user seeding...");
    await mongoose.connect(dbUri);
    console.log("Database connection successful.");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@neuralpath.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "adminpassword";

    // Check if any admin user already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(`An admin user already exists in the database (Email: ${existingAdmin.email}). Seeding skipped.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`No admin found. Registering initial admin with email: ${adminEmail}...`);
    const defaultAdmin = new User({
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      name: "System Administrator",
      targetRole: "System Oversight",
      company: "NeuralPath"
    });

    await defaultAdmin.save();
    console.log("Admin user seeded and saved successfully!");

    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during manual admin seeding:", error.message);
    process.exit(1);
  }
};

seedAdmin();
