import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Course", "Lab"],
    default: "Course",
  },
  duration: {
    type: String,
    default: "3 hrs",
  },
  level: {
    type: String,
    enum: ["Basic", "Intermediate", "Advanced"],
    default: "Intermediate",
  },
  description: {
    type: String,
    default: "",
  },
  skillName: {
    type: String,
    required: true,
  },
  videos: [
    {
      segment: { type: Number },
      title: { type: String },
      videoUrl: { type: String },
    },
  ],
});

const phaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#8b5cf6",
  },
  modules: [moduleSchema],
});

const learningPathSchema = new mongoose.Schema(
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
    orderedSkills: {
      type: [String],
      default: [],
    },
    phases: [phaseSchema],
  },
  {
    timestamps: true,
  }
);

const LearningPath = mongoose.model("LearningPath", learningPathSchema);

export default LearningPath;
