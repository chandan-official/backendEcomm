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

const router = express.Router();

// -------------------------------------------------------------
// PUBLIC ROUTES
// -------------------------------------------------------------
router.post("/register", registerVendor);
router.post("/login", loginVendor);

// -------------------------------------------------------------
// PROTECTED VENDOR ROUTES
// -------------------------------------------------------------
const vendorAuth = [verifyToken, verifyVendor];

// Vendor Profile Routes
router.get("/profile", vendorAuth, getVendorProfile);
router.put("/profile", vendorAuth, updateVendorProfile);

// Vendor Product CRUD Routes
router.post(
  "/products",
  vendorAuth,

  createVendorProduct
);

router.get("/products", vendorAuth, getVendorProducts);

router.put("/products/:id", vendorAuth, updateVendorProduct);

router.delete("/products/:id", vendorAuth, deleteVendorProduct);

// vendorRoutes.js

router.get("/orders", vendorAuth, getVendorOrders);

router.put("/orders/:id/status", vendorAuth, updateVendorOrderStatus);

export default router;
