// vendorController.js
import Vendor from "../models/vendorModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerVendor = async (req, res) => {
  try {
    const { name, email, password, shopName } = req.body;

    const existing = await Vendor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const vendor = await Vendor.create({
      name,
      email,
      password: hashed,
      shopName,
      role: "vendor",
    });

    // ⭐ Create JWT Token
    const token = jwt.sign(
      {
        id: vendor._id,
        email: vendor.email,
        role: vendor.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        shopName: vendor.shopName,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering vendor", error });
  }
};

export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const valid = await bcrypt.compare(password, vendor.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ⭐ Create JWT Token
    const token = jwt.sign(
      {
        id: vendor._id,
        email: vendor.email,
        role: vendor.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Vendor logged in successfully",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        shopName: vendor.shopName,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in vendor", error });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select("-password");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.json({ vendor });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching profile", error });
  }
};

export const updateVendorProfile = async (req, res) => {
  try {
    const { name, shopName, password } = req.body;

    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (name) vendor.name = name;
    if (shopName) vendor.shopName = shopName;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      vendor.password = hashed;
    }

    await vendor.save();

    return res.json({ message: "Profile updated successfully", vendor });
  } catch (error) {
    return res.status(500).json({ message: "Error updating profile", error });
  }
};

export default {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
};
