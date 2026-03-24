const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    weekStart: { type: Date, required: true },

    arrivalTime: { type: Date }, // set on start
    completedAt: { type: Date }, // set on finish

    notes: { type: String, default: "" },
    signatureUrl: { type: String, default: "" },

    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED"],
      default: "IN_PROGRESS",
    },

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
