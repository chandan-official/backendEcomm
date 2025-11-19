import jwt from "jsonwebtoken";

// Register (Admin or Vendor)
// createDefaultAdmin.js
import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";

export const createDefaultAdmin = async () => {
  const existing = await Admin.findOne({ role: "admin" });

  if (!existing) {
    const hashed = await bcrypt.hash("Admin@123", 10);

    await Admin.create({
      name: "Super Admin",
      email: "admin@wishzapp.com",
      password: hashed,
      role: "admin",
      isDefaultAdmin: true,
    });

    console.log("✔ Default Admin Created");
  } else {
    console.log("✔ Admin already exists");
  }
};

// changeAdminPassword controller
export const changeAdminPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);

    const hashed = await bcrypt.hash(req.body.newPassword, 10);

    admin.password = hashed;
    admin.isDefaultAdmin = false; // ❗ STOP DEFAULT LOGIN
    await admin.save();

    res.json({
      message: "Password updated. Default login disabled permanently.",
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find Admin
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2️⃣ BLOCK default admin after custom password is set
    if (email === "admin@wishzapp.com") {
      if (user.isDefaultAdmin === false) {
        // Default credentials should not work anymore
        if (password === "Admin@123") {
          return res.status(403).json({
            message: "Default admin credentials are no longer valid.",
          });
        }
      }
    }

    // 3️⃣ Check Password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // 4️⃣ If login happens using ANY password not equal to the default → disable default admin
    if (email === "admin@wishzapp.com" && password !== "Admin@123") {
      if (user.isDefaultAdmin === true) {
        user.isDefaultAdmin = false;
        await user.save(); // Now default login will never work
      }
    }

    // 5️⃣ Create Token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Respond
    return res.status(200).json({
      message: "Admin logged in successfully",
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isDefaultAdmin: user.isDefaultAdmin,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error logging in admin",
      error: error.message,
    });
  }
};
