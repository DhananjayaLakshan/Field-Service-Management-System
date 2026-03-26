const Visit = require("../models/visitModel");
const Company = require("../models/companyModel");
const ApiError = require("../utils/ApiError");

// Monday 00:00 UTC of the current week
function getWeekStartUTC(date = new Date()) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * @desc    Overall weekly visit overview (company-wise) with Filters
 * @route   GET /api/visits/overview/current-week
 * @access  Authenticated (Admin / Manager / Users - read only)
 */
exports.getOverallCurrentWeekOverview = async (req, res, next) => {
  try {
    const {
      weekStart: queryWeekStart,
      startDate,
      endDate,
      companyId,
      employeeId,
    } = req.query;

    // 1. Build the Visit Match Filter
    let visitMatchStage = {};
    let weekStart = null;

    // Filter by exact date range OR by weekStart
    if (startDate && endDate) {
      visitMatchStage.arrivalTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"), // End of the end date
      };
    } else {
      weekStart = queryWeekStart
        ? getWeekStartUTC(new Date(queryWeekStart))
        : getWeekStartUTC(new Date());
      visitMatchStage.weekStart = weekStart;
    }

    if (employeeId) visitMatchStage.employee = employeeId;
    if (companyId) visitMatchStage.company = companyId;

    // 2. Build the Company Match Filter
    let companyMatchStage = {};
    if (companyId) companyMatchStage._id = companyId;

    // Fetch filtered companies
    const companies = await Company.find(companyMatchStage).select("name");

    // Fetch filtered visits
    const visits = await Visit.find(visitMatchStage)
      .populate("company", "name")
      .populate("employee", "name email")
      .sort({ arrivalTime: 1 });

    // 3. Group visits by companyId
    const visitsByCompany = {};
    for (const visit of visits) {
      const compId = String(visit.company._id);

      if (!visitsByCompany[compId]) {
        visitsByCompany[compId] = [];
      }

      visitsByCompany[compId].push({
        visitId: visit._id,
        employee: visit.employee,
        arrivalTime: visit.arrivalTime,
        visitedAt: visit.visitedAt,
        completedAt: visit.completedAt,
        notes: visit.notes,
        signatureUrl: visit.signatureUrl,
      });
    }

    // 4. Build final response arrays
    const visitedCompanies = [];
    const notVisitedCompanies = [];

    for (const company of companies) {
      const compId = String(company._id);
      const companyVisits = visitsByCompany[compId] || [];

      if (companyVisits.length > 0) {
        visitedCompanies.push({
          company,
          visits: companyVisits,
        });
      } else {
        notVisitedCompanies.push(company);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        weekStart: weekStart || startDate, // Return standard weekStart or custom startDate
        stats: {
          totalCompanies: companies.length,
          visitedCompanies: visitedCompanies.length,
          notVisitedCompanies: notVisitedCompanies.length,
        },
        visitedCompanies,
        notVisitedCompanies,
      },
    });
  } catch (err) {
    next(err);
  }
};
