const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  deleteUser,
  updateUserRole,
} = require("../controllers/userController");

// Admin-only routes
router.get("/", authMiddleware, authorizeRoles("Admin"), getAllUsers);
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deleteUser);
router.patch(
  "/:id/role",
  authMiddleware,
  authorizeRoles("Admin"),
  updateUserRole,
);

module.exports = router;
