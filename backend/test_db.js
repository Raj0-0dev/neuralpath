import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.db.collection("users").find({}).toArray();
  const resumes = await mongoose.connection.db.collection("resumes").find({}).toArray();
  const empskills = await mongoose.connection.db.collection("employeeskills").find({}).toArray();
  const gapanalyses = await mongoose.connection.db.collection("gapanalyses").find({}).toArray();

  console.log("--- USERS ---");
  console.log(users.map(u => ({ id: u._id, email: u.email, role: u.role, name: u.name, targetRole: u.targetRole })));
  console.log("--- RESUMES ---");
  console.log(resumes.map(r => ({ id: r._id, employeeId: r.employeeId, fileUrl: r.fileUrl, textLength: r.extractedText?.length })));
  console.log("--- EMPLOYEE SKILLS ---");
  console.log(empskills.map(e => ({ id: e._id, employeeId: e.employeeId, skillsCount: e.skills?.length, skills: e.skills })));
  console.log("--- GAP ANALYSES ---");
  console.log(gapanalyses.map(g => ({ id: g._id, employeeId: g.employeeId, targetRole: g.targetRole, matching: g.matchingSkills, missing: g.missingSkills })));

  await mongoose.disconnect();
};

run().catch(console.error);
