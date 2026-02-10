const Payment = require("../models/paymentModel");
const Visit = require("../models/visitModel");
const ApiError = require("../utils/ApiError");
const { updatePaymentSchema } = require("../validations/paymentValidation");

function getWeekStartUTC(date = new Date()) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * @desc    Get current week payments (employee)
 * @route   GET /api/payments/my/current-week
 */
exports.getMyCurrentWeekPayments = async (req, res, next) => {
  try {
    const weekStart = getWeekStartUTC(new Date());

    const payments = await Payment.find({
      employee: req.user._id,
      weekStart,
    })
      .populate("company", "name")
      .populate("visit", "arrivalTime");

    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update payment (employee: cost & location only)
 * @route   PUT /api/payments/:id
 */
exports.updatePayment = async (req, res, next) => {
  try {
    const { error } = updatePaymentSchema.validate(req.body);
    if (error) return next(new ApiError(400, error.details[0].message));

    const payment = await Payment.findById(req.params.id);
    if (!payment) return next(new ApiError(404, "Payment not found"));

    // 🔐 Employee rules
    if (req.user.role === "Employee") {
      if (String(payment.employee) !== String(req.user._id)) {
        return next(new ApiError(403, "Access denied"));
      }

      const currentWeek = getWeekStartUTC(new Date());
      if (payment.weekStart.getTime() !== currentWeek.getTime()) {
        return next(new ApiError(403, "Cannot edit past week payments"));
      }
    }

    if (req.body.fromLocation !== undefined)
      payment.fromLocation = req.body.fromLocation;

    if (req.body.cost !== undefined) payment.cost = req.body.cost;

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete payment (Admin / Manager only)
 * @route   DELETE /api/payments/:id
 */
exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return next(new ApiError(404, "Payment not found"));

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
