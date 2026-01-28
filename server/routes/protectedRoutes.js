const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
  "/admin-only",
  authMiddleware,
  authorizeRoles("Admin"),
  (req, res) => {
    res.json({
      success: true,
      message: `Welcome Admin ${req.user.name}`,
    });
  },
);

router.get(
  "/manager-or-admin",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  (req, res) => {
    res.json({
      success: true,
      message: `Welcome ${req.user.role} ${req.user.name}`,
    });
  },
);

module.exports = router;
