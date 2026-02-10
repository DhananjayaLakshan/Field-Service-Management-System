const Visit = require("../models/visitModel");
const Company = require("../models/companyModel");
const ApiError = require("../utils/ApiError");
const {
  createVisitSchema,
  updateVisitSchema,
} = require("../validations/visitValidation");

// Monday 00:00:00 UTC of the week for a date
function getWeekStartUTC(date = new Date()) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day; // move to Monday
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isSameWeekUTC(weekStartA, weekStartB) {
  return new Date(weekStartA).getTime() === new Date(weekStartB).getTime();
}

/**
 * @desc    Create a visit (Employee can create for current week only)
 * @route   POST /api/visits
 * @access  Authenticated (Admin/Manager/Employee)
 */
exports.createVisit = async (req, res, next) => {
  try {
    const { error } = createVisitSchema.validate(req.body);
    if (error) return next(new ApiError(400, error.details[0].message));

    const { companyId, arrivalTime, visitedAt, notes, signatureUrl } = req.body;

    const company = await Company.findById(companyId);
    if (!company) return next(new ApiError(404, "Company not found"));

    const arrival = new Date(arrivalTime);
    if (Number.isNaN(arrival.getTime())) {
      return next(new ApiError(400, "Invalid arrival time"));
    }

    const visitDate = visitedAt ? new Date(visitedAt) : new Date();
    const weekStart = getWeekStartUTC(visitDate);
    const currentWeekStart = getWeekStartUTC(new Date());

    // Employees can only create visits for the current week
    if (
      req.user.role === "Employee" &&
      !isSameWeekUTC(weekStart, currentWeekStart)
    ) {
      return next(
        new ApiError(403, "Employees can only add visits for the current week"),
      );
    }

    const visit = await Visit.create({
      company: company._id,
      employee: req.user._id,
      weekStart,
      visitedAt: visitDate,
      arrivalTime: arrival,
      notes: notes || "",
      signatureUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Visit submitted successfully",
      data: visit,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current week's dashboard for the logged-in user
 *          - shows visits this week
 *          - shows remaining assigned companies (assignedUser == this user) not yet visited by them this week
 * @route   GET /api/visits/dashboard/current-week
 * @access  Authenticated
 */
exports.getCurrentWeekDashboard = async (req, res, next) => {
  try {
    const weekStart = getWeekStartUTC(new Date());

    // visits by this user in current week
    const visits = await Visit.find({ employee: req.user._id, weekStart })
      .populate(
        "company",
        "name address contactPerson contactNumber assignedUser",
      )
      .sort({ visitedAt: -1 });

    // visited company ids (unique)
    const visitedCompanyIds = new Set(
      visits.map((v) => String(v.company?._id)),
    );

    // "Required" companies for this user = assigned to them
    const assignedCompanies = await Company.find({
      assignedUser: req.user._id,
    }).select("name address");

    const remainingCompanies = assignedCompanies.filter(
      (c) => !visitedCompanyIds.has(String(c._id)),
    );

    res.status(200).json({
      success: true,
      data: {
        weekStart,
        visits,
        stats: {
          totalAssignedCompanies: assignedCompanies.length,
          visitedAssignedCompanies:
            assignedCompanies.length - remainingCompanies.length,
          remainingAssignedCompanies: remainingCompanies.length,
        },
        remainingCompanies,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get visits for a given week (employees can read, not edit)
 * @route   GET /api/visits?weekStart=YYYY-MM-DD
 * @access  Authenticated
 *
 * Notes:
 * - Employee: only returns their own visits
 * - Admin/Manager: can return all visits, optionally filter by employeeId/companyId
 */
exports.getVisitsByWeek = async (req, res, next) => {
  try {
    const { weekStart: weekStartStr, employeeId, companyId } = req.query;

    const weekStart = weekStartStr
      ? getWeekStartUTC(new Date(weekStartStr))
      : getWeekStartUTC(new Date());

    const filter = { weekStart };

    if (req.user.role === "Employee") {
      filter.employee = req.user._id;
    } else {
      if (employeeId) filter.employee = employeeId;
    }

    if (companyId) filter.company = companyId;

    const visits = await Visit.find(filter)
      .populate("company", "name address assignedUser")
      .populate("employee", "name email role")
      .sort({ visitedAt: -1 });

    res.status(200).json({
      success: true,
      data: { weekStart, visits },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a visit (ONLY Admin/Manager)
 * @route   PUT /api/visits/:id
 * @access  Admin/Manager
 */
exports.updateVisit = async (req, res, next) => {
  try {
    const { error } = updateVisitSchema.validate(req.body);
    if (error) return next(new ApiError(400, error.details[0].message));

    const visit = await Visit.findById(req.params.id);
    if (!visit) return next(new ApiError(404, "Visit not found"));

    // Update allowed fields
    if (req.body.arrivalTime) {
      visit.arrivalTime = new Date(req.body.arrivalTime);
    }
    if (req.body.visitedAt) visit.visitedAt = new Date(req.body.visitedAt);
    if (typeof req.body.notes === "string") visit.notes = req.body.notes;
    if (req.body.signatureUrl) visit.signatureUrl = req.body.signatureUrl;

    // keep weekStart consistent if visitedAt changed
    if (req.body.visitedAt) {
      visit.weekStart = getWeekStartUTC(new Date(req.body.visitedAt));
    }

    await visit.save();

    res.status(200).json({
      success: true,
      message: "Visit updated successfully",
      data: visit,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a visit (ONLY Admin/Manager)
 * @route   DELETE /api/visits/:id
 * @access  Admin/Manager
 */
exports.deleteVisit = async (req, res, next) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);
    if (!visit) return next(new ApiError(404, "Visit not found"));

    res.status(200).json({
      success: true,
      message: "Visit deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
