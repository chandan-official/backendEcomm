// controllers/profileController.js
import User from "../models/profileModel.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // req.user.id should come from auth middleware
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses || [], // Make sure addresses is always returned
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

// Add a new address
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure addresses array exists
    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    const { phone, city, state, postalCode, street, country, label } = req.body;

    if (!phone || !city || !state || !postalCode || !street) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const newAddress = {
      phone,
      city,
      state,
      postalCode,
      street,
      country,
      label,
    };
    user.addresses.push(newAddress);

    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res
      .status(500)
      .json({ message: "Error adding address", error: error.message });
  }
};

// Get all addresses for a user
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching addresses", error: error.message });
  }
};

// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );
    const savedUser = await user.save();

    res.status(200).json({
      message: "Address deleted successfully",
      addresses: savedUser.addresses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting address", error: error.message });
  }
};

// Update an address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addrIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addrIndex === -1)
      return res.status(404).json({ message: "Address not found" });

    const updatedData = req.body;

    // If updating isDefault, reset others
    if (updatedData.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses[addrIndex] = {
      ...user.addresses[addrIndex]._doc,
      ...updatedData,
    };
    const savedUser = await user.save();

    res.status(200).json({
      message: "Address updated successfully",
      addresses: savedUser.addresses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating address", error: error.message });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.forEach(
      (addr) => (addr.isDefault = addr._id.toString() === req.params.id)
    );
    await user.save();

    res
      .status(200)
      .json({ message: "Default address set", addresses: user.addresses });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error setting default address", error: error.message });
  }
};
