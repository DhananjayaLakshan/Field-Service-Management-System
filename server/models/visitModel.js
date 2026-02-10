const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Week bucket: store the Monday 00:00:00 (UTC) of that week
    weekStart: {
      type: Date,
      required: true,
      index: true,
    },

    visitedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // Signature URL required to submit a visit
    signatureUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional: who created the visit record (usually same as employee)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Helpful indexes
visitSchema.index({ company: 1, weekStart: 1 });
visitSchema.index({ employee: 1, weekStart: 1 });

module.exports = mongoose.model("Visit", visitSchema);
