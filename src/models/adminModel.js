// adminModel.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "admin" },
  isDefaultAdmin: { type: Boolean, default: true }, // ⭐ new field
});

export default mongoose.model("Admin", adminSchema);
