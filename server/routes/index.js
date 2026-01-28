const express = require("express");
const authRoutes = require("./authRoutes");
const protectedRoutes = require("./protectedRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

// ✅ Mount all API routes
router.use("/auth", authRoutes);
router.use("/protected", protectedRoutes);
router.use("/users", userRoutes);

module.exports = router;
