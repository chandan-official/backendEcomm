import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  colony: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const vendorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    shopName: { type: String, required: true },
    panNo: { type: String, required: true },
    gstNo: { type: String },
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    password: { type: String, required: true },
    aadhaarFront: { type: String, required: true },
    aadhaarBack: { type: String, required: true },
    shopImages: { type: [String], required: true, default: [] },

    role: { type: String, default: "vendor" },
    isActive: { type: Boolean, default: true },

    addresses: { type: [addressSchema], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
