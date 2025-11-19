import Category from "../models/categoryModel.js";
import slugify from "slugify";

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, parentCategory, description } = req.body;
    const slug = slugify(name, { lower: true });

    const existing = await Category.findOne({ slug });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const category = new Category({ name, slug, description, parentCategory });
    await category.save();

    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parentCategory", "name");
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive, slug: slugify(name, { lower: true }) },
      { new: true }
    );
    res.status(200).json({ message: "Category updated successfully", updated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};
