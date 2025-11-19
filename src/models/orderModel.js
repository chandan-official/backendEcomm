import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        price: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending", // When order is placed
        "confirmed", // Vendor confirms
        "packed", // Vendor packs
        "in_transit", // Pickup + logistics
        "delivered", // At customer
        "cancelled", // Vendor or admin cancels
      ],
      default: "pending",
    },

    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    paymentInfo: {
      method: String,
      transactionId: String,
      status: String, // paid/unpaid/refunded
    },

    address: {
      fullName: String,
      phone: String,
      city: String,
      state: String,
      pincode: String,
      street: String,
      landmark: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
