const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const {
  registerSchema,
  loginSchema,
} = require("../validations/authValidation");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Helper to generate tokens
const generateTokens = (user) => {
  const payload = { id: user._id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

// ==============================
// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(409, "Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          accessToken,
        },
      });
  } catch (err) {
    next(err);
  }
};

// ==============================
// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, "Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, "Invalid email or password");

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          accessToken,
        },
      });
  } catch (err) {
    next(err);
  }
};

// ==============================
// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return next(new ApiError(401, "Refresh token missing"));

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return next(new ApiError(404, "User not found"));

    if (user.refreshToken !== refreshToken) {
      return next(new ApiError(403, "Refresh token invalid"));
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    next(new ApiError(403, "Invalid or expired refresh token"));
  }
};

// ==============================
// @desc    Logout user (invalidate refresh token)
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // If no cookie → just return success (already logged out)
    if (!refreshToken) {
      return res.clearCookie("refreshToken", cookieOptions).status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }

    // Find user by refresh token (safer than verifying first)
    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // Always clear cookie
    res.clearCookie("refreshToken", cookieOptions).status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};
