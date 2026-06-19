import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  segment: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
});

const skillVideoSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    videos: [videoSchema],
  },
  {
    timestamps: true,
  }
);

const SkillVideo = mongoose.model("SkillVideo", skillVideoSchema);

export default SkillVideo;
