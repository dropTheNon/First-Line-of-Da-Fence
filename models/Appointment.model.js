const { Schema, model } = require("mongoose");

const appointmentSchema = new Schema(
  {
    subject: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    estimator: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lead: [{ type: Schema.Types.ObjectId, ref: "Lead", required: true }],
    files: [{ type: String }],
    notes: String,
    driveBy: Boolean,
  },
  {
    timestamps: true,
  }
);

const Appointment = model("Appointment", appointmentSchema);

module.exports = Appointment;