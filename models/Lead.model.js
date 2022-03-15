const { Schema, model } = require("mongoose");

const leadSchema = new Schema(
  {
    name: {
        type: String,
        required: true,
    },
    addressStreet: String,
    addressCity: String,
    addressState: String,
    addressZipcode: Number,
    billingAddressStreet: String,
    billingAddressCity: String,
    billingAddressState: String,
    billingAddressZipcode: Number,
    contactName: String,
    createdBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    emailAddress: String,
    estimateAppointment: [{ type: Schema.Types.ObjectId, ref: "Appointments" }],
    estimator: [{ type: Schema.Types.ObjectId, ref: "User" }],
    files: [{ type: String }],
    notes: String,
    phoneNumber: {
        type: Number,
        required: true,
    },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  {
    timestamps: true,
  }
);

const Lead = model("Lead", leadSchema);

module.exports = Lead;