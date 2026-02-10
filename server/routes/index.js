const express = require("express");
const authRoutes = require("./authRoutes");
const protectedRoutes = require("./protectedRoutes");
const userRoutes = require("./userRoutes");
const companyRoutes = require("./companyRoutes");
const visitRoutes = require("./visitRoutes");
const paymentRoutes = require("./paymentRoutes");

const router = express.Router();

// ✅ Mount all API routes
router.use("/auth", authRoutes);
router.use("/protected", protectedRoutes);
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/visits", visitRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
