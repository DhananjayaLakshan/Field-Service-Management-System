const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally, fetch full user from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new ApiError(404, "User not found"));

    req.user = user;
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};

module.exports = authMiddleware;
