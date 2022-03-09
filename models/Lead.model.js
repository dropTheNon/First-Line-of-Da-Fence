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
    emailAddress: String,
    estimateAppointment: [{ type: Schema.Types.ObjectId, ref: "Appointments" }],
    estimator: [{ type: Schema.Types.ObjectId, ref: "User" }],
    files: [{ type: String }],
    notes: String,
    phoneNumber: {
        type: Number,
        required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Lead = model("Lead", leadSchema);

module.exports = Lead;