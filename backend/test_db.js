import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.db.collection("users").find({}).toArray();
  const skillvideos = await mongoose.connection.db.collection("skillvideos").find({}).toArray();
  console.log("Users in DB:", users.map(u => ({ id: u._id, email: u.email, role: u.role })));
  console.log("SkillVideos count:", skillvideos.length);
  if (skillvideos.length > 0) {
    console.log("Sample skillvideo skillName:", skillvideos[0].skillName);
    console.log("Sample skillvideo videos count:", skillvideos[0].videos?.length);
  }
  await mongoose.disconnect();
};

run().catch(console.error);
