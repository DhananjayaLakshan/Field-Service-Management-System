const Booking = require("../models/bookingModel");
const VirusGuard = require("../models/virusGuardModel");

exports.getAllBookings = async (req, res, next) => {
  try {
    const { paymentStatus, date, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (date) {
      filter.date = { $regex: `^${date}` };
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate({
          path: "virusGuard",
          model: VirusGuard,
          select: "name",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: pageNumber < Math.ceil(total / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
