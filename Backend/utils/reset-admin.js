const mongoose = require("mongoose");
const usermodel = require("../models/User"); // Path check kari lejo
const { hashPass } = require("./EncryptPass");

async function resetAdmin() {
  try {
    await mongoose.connect("mongodb://localhost:27017/pulsework");

    const newPassword = await hashPass("admin123"); // Tamaro navo password

    const updatedUser = await usermodel.findOneAndUpdate(
      { email: "admin@gmail.com" },
      { password: newPassword },
      { new: true },
    );

    if (updatedUser) {
      console.log("✅ Password successfully updated to: admin123");
    } else {
      console.log("❌ User not found!");
    }
    process.exit();
  } catch (err) {
    console.error(err);
  }
}

resetAdmin();
