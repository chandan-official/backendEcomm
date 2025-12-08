// src/routes/productRoute.js
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
import verifyToken from "../token-config/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

// Public
router.get("/getProducts", getProducts);
router.get("/getProductById/:id", getProductById);

// Protected (Admin)
router.post(
  "/addproduct",
  // verifyToken,
  // verifyAdmin,
  upload.fields([{ name: "productImageurls", maxCount: 6 }]),
  validateProduct,
  createProduct
);
router.put(
  "/update/:id",
  // verifyToken,
  // verifyAdmin,
  upload.fields([{ name: "productImageurls", maxCount: 6 }]),
  updateProduct
);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

export default router;
