// src/controllers/productController.js
import Product from "../models/productModel.js";
import { uploadBufferToCloudinary } from "../utils/upload.js";
import slugify from "slugify";
import { uploadToSpaces } from "../utils/uploadToSpaces.js";

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

    let productImageurls = [];

    if (req.files && req.files.productImageurls) {
      try {
        for (const file of req.files.productImageurls) {
          const fileName = `products/${Date.now()}_${file.originalname}`;
          const url = await uploadToSpaces(file, fileName);
          productImageurls.push({ url });
        }
      } catch (error) {
        console.error("Error uploading images to Spaces:", error);
        return res
          .status(500)
          .json({ success: false, message: "Image upload failed" });
      }
    }

    const product = new Product({
      name,
      slug,
      description,
      category,
      price,
      compareAtPrice,
      stock,
      sku,
      productImageurls: productImageurls,
      attributes: attributes || {},
      tags,
      isActive: isActive === "false" ? false : true,
      vendorId,
    });

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

    let body = { ...req.body };

    // Parse JSON strings
    if (body.attributes && typeof body.attributes === "string") {
      body.attributes = JSON.parse(body.attributes);
    }
    if (body.tags && typeof body.tags === "string") {
      body.tags = body.tags.split(",").map((t) => t.trim());
    }
    if (body.deleteImages && typeof body.deleteImages === "string") {
      body.deleteImages = JSON.parse(body.deleteImages);
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // -------------------------
    // 1️⃣ DELETE SELECTED IMAGES
    // -------------------------
    if (Array.isArray(body.deleteImages)) {
      for (const imgUrl of body.deleteImages) {
        const key = imgUrl.split(".com/")[1];
        await deleteFromSpaces(key);

        product.productImageurls = product.productImageurls.filter(
          (p) => p.url !== imgUrl
        );
      }
    }

    // -------------------------
    // 2️⃣ ADD NEW IMAGES (MULTIPLE)
    // -------------------------
    if (req.files && req.files.productImageurls) {
      for (const file of req.files.productImageurls) {
        const fileName = `products/${Date.now()}_${file.originalname}`;
        const url = await uploadToSpaces(file, fileName);
        product.productImageurls.push({ url });
      }
    }

    // -------------------------
    // 3️⃣ UPDATE TEXT FIELDS
    // -------------------------
    Object.assign(product, body);

    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
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

    for (const img of product.images) {
      const key = img.url.split(".com/")[1]; // extract key
      await deleteFromSpaces(key);
    }

    // soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({ success: true, message: "Product removed (soft)" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    const imageUrl = req.body.imageUrl;
    const key = imageUrl.split(".com/")[1]; // extract key

    // delete file from DigitalOcean
    await deleteFromSpaces(key);

    // remove from DB
    product.images = product.images.filter((img) => img !== imageUrl);
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    console.error("deleteProductImage error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
