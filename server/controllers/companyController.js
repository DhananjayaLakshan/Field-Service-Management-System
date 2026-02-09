const Company = require("../models/companyModel");
const ApiError = require("../utils/ApiError");
const {
  createCompanySchema,
  updateCompanySchema,
} = require("../validations/companyValidation");

// ==============================
// @desc    Create Company
// @route   POST /api/companies
// @access  Admin, Manager
exports.createCompany = async (req, res, next) => {
  try {
    const { error } = createCompanySchema.validate(req.body);
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }

    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ApiError(409, "Company with this name already exists"));
    }
    next(err);
  }
};

// ==============================
// @desc    Get all companies
// @route   GET /api/companies
// @access  Authenticated users
exports.getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().populate("assignedUser", "name");
    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Authenticated users
exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      "assignedUser",
      "name",
    );
    if (!company) throw new ApiError(404, "Company not found");

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (err) {
    next(err);
  }
};

// ==============================
// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Admin, Manager
exports.updateCompany = async (req, res, next) => {
  try {
    const { error } = updateCompanySchema.validate(req.body);

    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }

    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!company) throw new ApiError(404, "Company not found");

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (err) {
    next(err);
  }
};

// ==============================
// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Admin, Manager
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) throw new ApiError(404, "Company not found");
    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
