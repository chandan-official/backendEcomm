// src/controllers/vendorProductController.js
import Product from "../models/productModel.js";
import { uploadBufferToCloudinary } from "../utils/upload.js";
import slugify from "slugify";
import { uploadToSpaces } from "../utils/uploadToSpaces.js";
/**
 * Create product for logged-in vendor
 */
export const createVendorProduct = async (req, res) => {
  try {
    const vendorId = req.user.id; // vendor from token

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
    } = req.body;

    // Convert numeric fields
    price = Number(price);
    compareAtPrice = compareAtPrice ? Number(compareAtPrice) : undefined;
    stock = stock ? Number(stock) : 0;

    // Tags (string -> array)
    tags = tags
      ? typeof tags === "string"
        ? tags.split(",").map((t) => t.trim())
        : tags
      : [];

    const slug = slugify(name, { lower: true, strict: true });

    // Parse attributes JSON (optional)
    if (typeof attributes === "string") {
      try {
        attributes = JSON.parse(attributes);
      } catch (err) {
        console.error("Invalid attributes JSON:", attributes);
        return res.status(400).json({ message: "Invalid attributes JSON" });
      }
    }

    // CREATE PRODUCT INSTANCE
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

    // -------------------------------
    // 📸 IMAGE UPLOAD HANDLING (Spaces)
    // -------------------------------

    let uploadedImages = [];

    if (req.files?.productImageurls) {
      for (const img of req.files.productImageurls) {
        const fileName = `products/${Date.now()}_${img.originalname}`;
        const url = await uploadToSpaces(img, fileName);

        uploadedImages.push({
          url,
          public_id: fileName, // S3/Spaces does not return public_id like Cloudinary
        });
      }
    }

    product.productImageurls = uploadedImages;

    // SAVE PRODUCT
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("createVendorProduct error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

/**
 * Get all products for logged-in vendor
 */
export const getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {
      vendorId,
      isActive: true,
    };

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

    const skip = (Number(page) - 1) * Number(limit);

    const products = console.log("🔥 VENDOR ID FROM TOKEN:", req.user.id);
    console.log("🔥 FILTER APPLIED:", filter);
    console.log("🔥 TOTAL PRODUCTS IN DB:", await Product.countDocuments());
    await Product.find(filter)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("getVendorProducts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update vendor product (only if the product belongs to the vendor)
 */
export const updateVendorProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId, vendorId });
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }

    const body = { ...req.body };

    if (body.attributes && typeof body.attributes === "string") {
      body.attributes = JSON.parse(body.attributes);
    }
    if (body.tags && typeof body.tags === "string") {
      body.tags = body.tags.split(",").map((t) => t.trim());
    }

    Object.assign(product, body);

    // Upload new images if provided (append)
    if (req.files && req.files.length > 0) {
      const uploadedImages = [];
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, "products");
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
      product.images = product.images.concat(uploadedImages);
    }

    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("updateVendorProduct error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Soft delete vendor product
 */
export const deleteVendorProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId, vendorId });
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product removed (soft deleted)",
    });
  } catch (error) {
    console.error("deleteVendorProduct error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
