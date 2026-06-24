import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import { seedSkillVideos } from "./data/seedVideos.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is not defined.");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server successfully listening on port ${PORT}`);
});

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully");
    try {
      await seedSkillVideos();
    } catch (seedErr) {
      console.error("Warning: Seeding failed on startup:", seedErr.message);
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

