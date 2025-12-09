import Address from "../models/addressModel.js";
import User from "../models/profileModel.js";
import { verifyToken } from "../token-config/verifyToken.js";
import mongoose from "mongoose";

// Example route: POST /addresses/add
export const addAddress = async (req, res) => {
  try {
    const {
      label,
      street,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
    } = req.body;

    // 1️⃣ Get userId from verified token
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // 2️⃣ Ensure user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Handle default address logic
    if (isDefault) {
      await Address.updateMany({ userId }, { $set: { isDefault: false } });
    }

    // 4️⃣ Create new address
    const newAddress = await Address.create({
      userId,
      label,
      street,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
    });

    res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res
      .status(500)
      .json({ message: "Error adding address", error: error.message });
  }
};

export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await Address.find({ userId });

    res.status(200).json({ addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    res
      .status(500)
      .json({ message: "Error fetching addresses", error: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    // 1. Check if address exists and belongs to user
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // 2. Set all user's addresses to non-default
    await Address.updateMany({ userId }, { $set: { isDefault: false } });

    // 3. Set selected address as default
    address.isDefault = true;
    await address.save();

    res
      .status(200)
      .json({ message: "Default address updated", address: address });
  } catch (error) {
    console.error("Set default address error:", error);
    res
      .status(500)
      .json({ message: "Error setting default address", error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user.id); // ensure ObjectId
    const { addressId } = req.params;

    // Check if address exists and belongs to user
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await Address.deleteOne({ _id: addressId });
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete address error:", error);
    res
      .status(500)
      .json({ message: "Error deleting address", error: error.message });
  }
};
