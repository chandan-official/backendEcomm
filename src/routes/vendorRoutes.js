// src/routes/vendorRoutes.js
import express from "express";

import {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
} from "../controller/vendorController.js";

import {
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorProducts,
} from "../controller/VendorProductController.js";

import { verifyToken, verifyVendor } from "../token-config/verifyToken.js";

import {
  getVendorOrders,
  updateVendorOrderStatus,
} from "../controller/VendorOrderController.js";

import upload from "../middleware/multer.js";

const router = express.Router();

// -------------------------------------------------------------
// PUBLIC ROUTES
// -------------------------------------------------------------
router.post(
  "/register",
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "shopImages", maxCount: 10 },
  ]),
  registerVendor
);
router.post("/login", loginVendor);

// -------------------------------------------------------------
// PROTECTED VENDOR ROUTES
// -------------------------------------------------------------
const vendorAuth = [verifyToken, verifyVendor];

// Vendor Profile Routes
router.get("/profile", vendorAuth, getVendorProfile);
router.put("/profile", vendorAuth, updateVendorProfile);

// Vendor Product CRUD Routes
// Vendor Product CRUD Routes
router.post(
  "/products",
  vendorAuth,
  upload.fields([
    { name: "productImageurls", maxCount: 10 }, // ADD THIS LINE
  ]),
  createVendorProduct
);

router.get(
  "/products",
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "vendor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  },
  getVendorProducts
);

router.put("/products/:id", vendorAuth, updateVendorProduct);

router.delete("/products/:id", vendorAuth, deleteVendorProduct);

// vendorRoutes.js

router.get("/orders", vendorAuth, getVendorOrders);

router.put("/orders/:id/status", vendorAuth, updateVendorOrderStatus);

export default router;
