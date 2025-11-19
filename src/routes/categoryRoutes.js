import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controller/categoryController.js";
import validateCategory from "../middleware/validateCategory.js";

const router = express.Router();

router.post("/create", validateCategory, createCategory);
router.get("/", getAllCategories);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
