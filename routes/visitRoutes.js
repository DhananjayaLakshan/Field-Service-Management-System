const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createVisit,
  getCurrentWeekDashboard,
  getVisitsByWeek,
  updateVisit,
  deleteVisit,
} = require("../controllers/visitController");

const {
  getOverallCurrentWeekOverview,
} = require("../controllers/visitOverviewController");

const {
  getEmployeeWeeklyOverview,
} = require("../controllers/visitEmployeeOverviewController");

// Create visit (any authenticated user, employees only current week enforced in controller)
router.post("/", authMiddleware, createVisit);

// Current week dashboard for logged-in user
router.get("/dashboard/current-week", authMiddleware, getCurrentWeekDashboard);

// Get visits by week (employees -> own visits; admin/manager -> can view all with filters)
router.get("/", authMiddleware, getVisitsByWeek);

// Employee-wise weekly overview (Admin / Manager)
router.get(
  "/overview/employee/:employeeId",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  getEmployeeWeeklyOverview,
);

// Overall weekly overview (company-wise)
router.get(
  "/overview/current-week",
  authMiddleware,
  getOverallCurrentWeekOverview,
);

// Only admin/manager can edit/delete visits
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  updateVisit,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  deleteVisit,
);

module.exports = router;
