import mongoose from "mongoose";

const gapAnalysisSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    matchingSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    matchPercentage: {
      type: Number,
      default: 0,
    },
    skillsWithScores: [
      {
        name: { type: String, required: true },
        score: { type: Number, default: 0 },
        reason: { type: String, default: "" }
      }
    ],
  },
  {
    timestamps: true,
  }
);

const GapAnalysis = mongoose.model("GapAnalysis", gapAnalysisSchema);

export default GapAnalysis;
