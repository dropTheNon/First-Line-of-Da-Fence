const { Schema, model } = require("mongoose");

const projectSchema = new Schema(
  {
    number: {
        type: String,
        required: true,
    },
    changeLog: [{ type: String }],
    createdBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    crewForeman: [{ type: Schema.Types.ObjectId, ref: "User" }],
    estimator: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    files: [{ type: String }],
    jobStatus: {
        type: String,
        enum: ["Set-up", "Being Reviewed", "Awaiting Materials", "Awaiting Scheduling", "Cancelled", "Ready", "On-Hold", "In-Progress", "Completed"],
        default: "Set-up",
    },
    lead: [{ type: Schema.Types.ObjectId, ref: "Lead", required: true }],
    materialsReady: {
        type: Boolean,
        default: false,
    },
    needsMFL: {
        type: Boolean,
        default: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

const Project = model("Project", projectSchema);

module.exports = Project;