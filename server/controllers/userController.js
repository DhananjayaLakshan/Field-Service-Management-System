const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

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

// @desc Update user (Admin only)
exports.updateUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    // Update name
    if (name) user.name = name;

    // Update email
    if (email) user.email = email;

    // Update role
    if (role) {
      if (!["Admin", "Manager", "Employee"].includes(role)) {
        throw new ApiError(400, "Invalid role");
      }
      user.role = role;
    }

    // Update password (only if provided)
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
