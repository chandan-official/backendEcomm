import Vendor from "../models/vendorModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadToSpaces } from "../utils/uploadToSpaces.js";

export const registerVendor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      shopName,
      panNo,
      gstNo,
      addresses,
      phone,
    } = req.body;

    // Parse addresses JSON
    let parsedAddresses = addresses;
    if (typeof addresses === "string") {
      try {
        parsedAddresses = JSON.parse(addresses);
      } catch (err) {
        console.error("Invalid JSON for addresses:", addresses);
        return res.status(400).json({ message: "Invalid addresses JSON" });
      }
    }

    // FILE HANDLING...
    let aadhaarFrontUrl = null;
    let aadhaarBackUrl = null;
    let shopImagesUrls = [];

    if (req.files?.aadhaarFront?.[0]) {
      const file = req.files.aadhaarFront[0];
      const fileName = `vendor/aadhaar/front/${Date.now()}_${
        file.originalname
      }`;
      aadhaarFrontUrl = await uploadToSpaces(file, fileName);
    }

    if (req.files?.aadhaarBack?.[0]) {
      const file = req.files.aadhaarBack[0];
      const fileName = `vendor/aadhaar/back/${Date.now()}_${file.originalname}`;
      aadhaarBackUrl = await uploadToSpaces(file, fileName);
    }

    if (req.files?.shopImages) {
      for (const img of req.files.shopImages) {
        const fileName = `vendor/shop/${Date.now()}_${img.originalname}`;
        const url = await uploadToSpaces(img, fileName);
        shopImagesUrls.push(url);
      }
    }

    // EMAIL EXISTS?
    const existing = await Vendor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const vendor = await Vendor.create({
      firstName,
      lastName,
      email,
      password: hashed,
      shopName,
      panNo,
      gstNo,
      addresses: parsedAddresses, // <-- FIXED
      role: "vendor",
      aadhaarFront: aadhaarFrontUrl,
      aadhaarBack: aadhaarBackUrl,
      shopImages: shopImagesUrls,
      phone: req.body.phone,
    });

    const token = jwt.sign(
      { id: vendor._id, email: vendor.email, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor,
      token,
    });
  } catch (error) {
    console.error("🔥 Vendor Register Error:", error); // <-- LOG THIS
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
