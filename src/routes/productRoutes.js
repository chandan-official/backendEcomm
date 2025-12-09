import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";

import upload from "../middleware/multer.js";
import { validateProduct } from "../middleware/validateProduct.js";

// FIXED IMPORT ↓↓↓
import { verifyToken, verifyVendor } from "../token-config/verifyToken.js";

const router = express.Router();

// Public Routes
router.get("/getProducts", getProducts);
router.get("/getProductById/:id", getProductById);

// Admin Routes
router.post(
  "/addproduct",
  verifyToken,
  verifyVendor,
  upload.fields([{ name: "productImageurls", maxCount: 6 }]),
  validateProduct,
  createProduct
);

router.put(
  "/update/:id",
  verifyToken,
  verifyVendor,
  upload.fields([{ name: "productImageurls", maxCount: 6 }]),
  updateProduct
);

router.delete("/:id", verifyToken, verifyVendor, deleteProduct);

export default router;
