// src/controllers/productController.js
import Product from "../models/productModel.js";
import { uploadBufferToCloudinary } from "../utils/upload.js";
import slugify from "slugify";

// Create product (with optional images uploaded via multer)
export const createProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      category,
      price,
      compareAtPrice,
      stock,
      sku,
      attributes,
      tags,
      isActive,
      vendorId,
    } = req.body;

    price = Number(price);
    compareAtPrice = compareAtPrice ? Number(compareAtPrice) : undefined;
    stock = stock ? Number(stock) : 0;
    tags = tags
      ? typeof tags === "string"
        ? tags.split(",").map((t) => t.trim())
        : tags
      : [];

    const slug = slugify(name, { lower: true, strict: true });

    const product = new Product({
      name,
      slug,
      description,
      category,
      price,
      compareAtPrice,
      stock,
      sku,
      attributes: attributes || {},
      tags,
      isActive: isActive === "false" ? false : true,
      vendorId,
    });

    // upload images if present
    if (req.files && req.files.length > 0) {
      const uploaded = [];
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, "products");
        uploaded.push({ url: result.secure_url, public_id: result.public_id });
      }
      product.images = uploaded;
    }

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get paginated products with filters/search
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      tags,
      sortBy = "createdAt",
      order = "desc",
      inStock,
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (minPrice)
      filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
    if (maxPrice)
      filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };
    if (tags) filter.tags = { $in: tags.split(",").map((t) => t.trim()) };
    if (inStock === "true") filter.stock = { $gt: 0 };

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(filter)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product by id or slug
export const getProductById = async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product (supports replacing/adding images)
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const body = { ...req.body };

    if (body.attributes && typeof body.attributes === "string") {
      body.attributes = JSON.parse(body.attributes);
    }
    if (body.tags && typeof body.tags === "string") {
      body.tags = body.tags.split(",").map((t) => t.trim());
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    Object.assign(product, body);

    // handle images if provided (append)
    if (req.files && req.files.length > 0) {
      const uploaded = [];
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, "products");
        uploaded.push({ url: result.secure_url, public_id: result.public_id });
      }
      product.images = product.images.concat(uploaded);
    }

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product (soft delete by default)
export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({ success: true, message: "Product removed (soft)" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
