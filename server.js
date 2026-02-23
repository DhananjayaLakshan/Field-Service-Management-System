require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ===================================
// ✅ Connect to Database
// ===================================
connectDB();

// ===================================
// ✅ Middleware
// ===================================

// 🔥 Increase body size BEFORE routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

// ✅ Proper CORS Setup
const allowedOrigins = ["http://localhost:5173", "https://support.inetsl.com"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / server calls

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ===================================
// ✅ Routes
// ===================================
app.use("/api", routes);

// ===================================
// ✅ Global Error Handler
// ===================================
app.use(errorHandler);

// ===================================
// ✅ Start the Server
// ===================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
