const { Schema, model } = require("mongoose");

const projectSchema = new Schema(
  {
    number: {
        type: Number,
        required: true.valueOf,
    },
    crewForeman: [{ type: Schema.Types.ObjectId, ref: "User" }],
    estimateAppointment: [{ type: Schema.Types.ObjectId, ref: "Appointments" }],
    estimator: [{ type: Schema.Types.ObjectId, ref: "User" }],
    files: [{ type: String }],
    jobStatus: {
        type: String,
        enum: ["Set-up", "Being Reviewed", "Awaiting Materials", "Awaiting Scheduling", "Cancelled", "Ready", "On-Hold", "In-Progress", "Completed"],
    },
    lead: [{ type: Schema.Types.ObjectId, ref: "Lead" }],
    materialsReady: Boolean,
    notes: String,
  },
  {
    timestamps: true,
  }
);

const Project = model("Project", projectSchema);

module.exports = Project;