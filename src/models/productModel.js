// src/models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, index: true, unique: true },
    description: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number }, // optional
    currency: { type: String, default: "INR" },
    stock: { type: Number, default: 0 },
    sku: { type: String },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    // dynamic attributes: e.g. { color: "red", size: "M", material: "gold", expiryDate: "2026-01-01" }
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [String],
    isActive: { type: Boolean, default: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }, // optional multi-vendor
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
