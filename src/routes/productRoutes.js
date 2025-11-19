// src/routes/productRoute.js
import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";

import { upload } from "../utils/upload.js";
import { validateProduct } from "../middleware/validateProduct.js";
import verifyToken from "../token-config/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected (Admin)
router.post(
  "/",
  verifyToken,
  verifyAdmin,
  upload.array("images", 8),
  validateProduct,
  createProduct
);
router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  upload.array("images", 8),
  updateProduct
);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

export default router;
