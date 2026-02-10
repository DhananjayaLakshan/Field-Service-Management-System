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
 * @desc    Overall weekly visit overview (company-wise)
 * @route   GET /api/visits/overview/current-week
 * @access  Authenticated (Admin / Manager / Users - read only)
 */
exports.getOverallCurrentWeekOverview = async (req, res, next) => {
  try {
    const weekStart = getWeekStartUTC(new Date());

    //Get all companies
    const companies = await Company.find().select(
      "name",
      //   "name address contactPerson contactNumber assignedUser",
    );

    //Get all visits for the current week
    const visits = await Visit.find({ weekStart })
      .populate("company", "name")
      .populate("employee", "name")
      .sort({ arrivalTime: 1 });

    //Group visits by companyId
    const visitsByCompany = {};
    for (const visit of visits) {
      const companyId = String(visit.company._id);

      if (!visitsByCompany[companyId]) {
        visitsByCompany[companyId] = [];
      }

      visitsByCompany[companyId].push({
        visitId: visit._id,
        employee: visit.employee,
        arrivalTime: visit.arrivalTime,
        visitedAt: visit.visitedAt,
        notes: visit.notes,
      });
    }

    //Build final response
    const visitedCompanies = [];
    const notVisitedCompanies = [];

    for (const company of companies) {
      const companyId = String(company._id);
      const companyVisits = visitsByCompany[companyId] || [];

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
        weekStart,
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
