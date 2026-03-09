const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const { getAllBookings } = require("../controllers/bookingController");

router.get(
  "/",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  getAllBookings,
);

module.exports = router;
