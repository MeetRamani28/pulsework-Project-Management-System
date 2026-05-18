const usermodel = require("../models/User");
const { hashPass } = require("../utils/EncryptPass");
const { generateToken } = require("../utils/GenrateToken");
const { comparePass } = require("../utils/DecryptPass");

// ✅ Register User
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, roles } = req.body;

    if (!name || !email || !password) {
      const error = new Error("All Fields Are Required");
      error.statusCode = 400;
      return next(error);
    }

    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      const error = new Error("Email Already Exists, Please Login");
      error.statusCode = 400;
      return next(error);
    }

    const hashedPassword = await hashPass(password);
    const newUser = await usermodel.create({
      name,
      email,
      password: hashedPassword,
      roles: roles || "employee",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
      },
    });
  } catch (error) {
    next(error); // 👈 centralized error handler
  }
};

// ✅ Login User
const loginUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      const error = new Error("All Fields Are Required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await usermodel.findOne(
      email ? { email } : { name: username },
    );

    if (!user) {
      const error = new Error("Invalid Credentials");
      error.statusCode = 400;
      return next(error);
    }

    const isMatch = await comparePass(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid Credentials");
      error.statusCode = 400;
      return next(error);
    }

    const token = generateToken({ id: user._id, roles: user.roles });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get Logged In User
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await usermodel
      .findById(userId)
      .select("-password")
      .populate({
        path: "notifications",
        populate: [
          { path: "project", select: "name status" },
          { path: "task", select: "title status" },
        ],
        options: { sort: { createdAt: -1 } },
      });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    req.session.destroy((err) => {
      if (err) console.error("Session destruction error:", err);
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getCurrentUser, logoutUser };
