const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getMyCurrentWeekPayments,
  updatePayment,
  deletePayment,
  getAdminWeeklyPayments,
} = require("../controllers/paymentController");

// Employee view (current week)
router.get("/my/current-week", authMiddleware, getMyCurrentWeekPayments);

// Update payment
router.put("/:id", authMiddleware, updatePayment);

// Admin / Manager only
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  deletePayment,
);

// Admin weekly fetch
router.get(
  "/admin",
  authMiddleware,
  authorizeRoles("Admin"),
  getAdminWeeklyPayments,
);

module.exports = router;
