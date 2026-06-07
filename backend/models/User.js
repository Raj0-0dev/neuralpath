import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    role: {
      type: String,
      enum: ["employee", "admin"],
      default: "employee",
    },
    targetRole: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // TODO: hash password here
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
