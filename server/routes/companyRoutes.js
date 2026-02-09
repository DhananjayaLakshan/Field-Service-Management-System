const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");

// ==============================
// READ
router.get("/", authMiddleware, getAllCompanies);
router.get("/:id", authMiddleware, getCompanyById);

// ==============================
// WRITE (Admin & Manager)
router.post(
  "/",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  createCompany,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  updateCompany,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  deleteCompany,
);

module.exports = router;
