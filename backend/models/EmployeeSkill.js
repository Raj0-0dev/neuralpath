import mongoose from "mongoose";

const employeeSkillSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    skillsWithScores: [
      {
        name: { type: String, required: true },
        score: { type: Number, default: 0 },
        reason: { type: String, default: "" }
      }
    ],
    matchPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const EmployeeSkill = mongoose.model("EmployeeSkill", employeeSkillSchema);

export default EmployeeSkill;
