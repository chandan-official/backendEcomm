import express from "express";
import {
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controller/profileController.js";
import validateAddress from "../middleware/validateProfile.js";
import verifyToken from "../token-config/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);
router.post("/address", verifyToken, validateAddress, addAddress);
router.delete("/address/:id", verifyToken, deleteAddress);
router.put("/address/default/:id", verifyToken, setDefaultAddress);

export default router;
