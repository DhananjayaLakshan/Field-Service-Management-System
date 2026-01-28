const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");

// @desc Get all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// @desc Delete user by ID (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

// @desc Update user role (Admin only)
exports.updateUserRole = async (req, res, next) => {
  const { role } = req.body;

  if (!["Admin", "Manager", "Employee"].includes(role)) {
    return next(new ApiError(400, "Invalid role"));
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: "User role updated",
      user,
    });
  } catch (err) {
    next(err);
  }
};
