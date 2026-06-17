import mongoose from "mongoose";

const progressTrackingSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    completedSkills: {
      type: [String],
      default: [],
    },
    completedModules: {
      type: [String], // Storing module IDs (e.g. "mod_0_0_javascript")
      default: [],
    },
    learningCompletionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const ProgressTracking = mongoose.model("ProgressTracking", progressTrackingSchema);

export default ProgressTracking;
