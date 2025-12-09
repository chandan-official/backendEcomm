import express from "express";
import {
  addAddress,
  getUserAddresses,
  setDefaultAddress,
  deleteAddress,
} from "../controller/addressController.js";
import validateAddress from "../middleware/validateProfile.js";
import { verifyToken } from "../token-config/verifyToken.js";

const router = express.Router();

// Get all addresses for the authenticated user
router.get("/get", verifyToken, getUserAddresses);

// Add a new address for the authenticated user
router.post("/add", verifyToken, validateAddress, addAddress);
router.put("/default/:id", verifyToken, setDefaultAddress);
router.delete("/delete/:id", verifyToken, deleteAddress);

export default router;
