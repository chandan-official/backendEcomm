import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  label: { type: String, default: "Home" }, // Home, Work, etc.
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: "India" },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

export default mongoose.models.Address ||
  mongoose.model("Address", addressSchema);
