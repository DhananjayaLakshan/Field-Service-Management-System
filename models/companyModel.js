const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    addressLink: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true, // Set to false if you want this to be optional
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["contract", "non-contract"],
      default: "non-contract",
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Company", companySchema);
