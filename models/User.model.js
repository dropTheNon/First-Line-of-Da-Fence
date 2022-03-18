const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["Admin", "Estimator", "Foreman", "Helper"],
      default: "Helper",
      required: true,
    },
    changeLog: [{ type: String }],
    leads: [{ type: Schema.Types.ObjectId, ref: "Lead" }],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    token: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
