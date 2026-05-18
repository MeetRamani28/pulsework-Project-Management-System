const express = require("express");
const app = express();
const jsonwebtoken = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
require("./config/database-connection");
const { errorHandler } = require("./middlewares/AuthMidddlewares");

const authRoutes = require("./routes/AuthRoutes");
const userRoutes = require("./routes/UserRoutes");
const projectRoutes = require("./routes/ProjectRoutes");
const taskRoutes = require("./routes/TaskRoutes");
const timeLogRoutes = require("./routes/TimeLogRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // prevent JS access to cookies
      secure: process.env.NODE_ENV === "production" ? true : false, // only https in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/timelogs", timeLogRoutes);
app.use("/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the WorkChrono✨!" });
});

app.use((req, res, next) => {
  const error = new Error("Route not found 🙃");
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
