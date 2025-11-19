// vendorModel.js
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    role: { type: String, default: "vendor" }, // 🔥 role fixed

    shopName: { type: String, required: false },
    shopAddress: { type: String, required: false },
    phone: { type: String, required: false },

    isActive: { type: Boolean, default: true }, // vendor can be blocked by admin
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
