import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String }, // snapshot
        image: { type: String }, // snapshot
        quantity: { type: Number },
        price: { type: Number },
      },
    ],
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "in_transit",
        "delivered",
        "cancelled",
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
      status: String,
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
