const Visit = require("../models/visitModel");
const Company = require("../models/companyModel");
const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");

// Monday 00:00 UTC of a given week
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
 * @desc    Employee-wise weekly visit overview
 * @route   GET /api/visits/overview/employee/:employeeId
 * @access  Admin / Manager
 * @query   weekStart=YYYY-MM-DD (optional)
 */
exports.getEmployeeWeeklyOverview = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { weekStart: weekStartStr } = req.query;

    const employee = await User.findById(employeeId).select("name email role");
    if (!employee) return next(new ApiError(404, "Employee not found"));

    const weekStart = weekStartStr
      ? getWeekStartUTC(new Date(weekStartStr))
      : getWeekStartUTC(new Date());

    // 1️⃣ All companies
    const companies = await Company.find().select(
      "name address contactPerson contactNumber assignedUser",
    );

    // 2️⃣ Visits by this employee for the week
    const visits = await Visit.find({
      employee: employeeId,
      weekStart,
    })
      .populate("company", "name address")
      .sort({ arrivalTime: 1 });

    // 3️⃣ Visited company IDs
    const visitedCompanyIds = new Set(
      visits.map((v) => String(v.company?._id)),
    );

    // 4️⃣ Remaining companies
    const remainingCompanies = companies.filter(
      (c) => !visitedCompanyIds.has(String(c._id)),
    );

    res.status(200).json({
      success: true,
      data: {
        weekStart,
        employee,
        stats: {
          totalCompanies: companies.length,
          visitedCompanies: visits.length,
          remainingCompanies: remainingCompanies.length,
        },
        visited: visits,
        remainingCompanies,
      },
    });
  } catch (err) {
    next(err);
  }
};
