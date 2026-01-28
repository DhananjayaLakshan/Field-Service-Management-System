require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/db");
const routes = require("./routes"); // 👈 index.js in routes/
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ===================================
// ✅ Connect to Database
// ===================================
connectDB();

// ===================================
// ✅ Middleware
// ===================================
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// ===================================
// ✅ Routes
// ===================================
app.use("/api", routes); // 👈 All routes mounted under /api

// ===================================
// ✅ Global Error Handler
// ===================================
app.use(errorHandler);

// ===================================
// ✅ Start the Server
// ===================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
