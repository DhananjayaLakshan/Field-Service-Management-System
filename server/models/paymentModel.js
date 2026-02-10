const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visit",
      required: true,
      unique: true, // 🔥 one payment per visit
    },

    weekStart: {
      type: Date,
      required: true,
      index: true,
    },

    // Editable by employee
    fromLocation: {
      type: String,
      trim: true,
      default: "",
    },

    cost: {
      type: Number,
      min: 0,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
