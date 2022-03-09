const { Schema, model } = require("mongoose");

const appointmentSchema = new Schema(
  {
    date: Date,
    estimator: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lead: [{ type: Schema.Types.ObjectId, ref: "Lead" }],
    files: [{ type: String }],
    notes: String,
  },
  {
    timestamps: true,
  }
);

const Appointment = model("Appointment", appointmentSchema);

module.exports = Appointment;