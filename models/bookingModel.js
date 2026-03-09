const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    mobileNumber: String,

    email: {
      type: String,
      required: true,
    },

    city: String,

    deviceType: {
      type: String,
      enum: ["Desktop", "Laptop"],
    },

    numberOfDevices: Number,

    notes: String,

    virusGuard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VirusGuard",
    },

    date: String,

    timeSlot: String,

    paymentStatus: {
      type: String,
      enum: ["PAID", "UNPAID"],
      default: "UNPAID",
    },
  },
  { timestamps: true },
);

BookingSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model("Booking", BookingSchema);
