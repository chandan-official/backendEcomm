import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String, // local path for now
      required: true,
    },
    status: {
      type: String,
      enum: ["generated", "sent", "viewed"],
      default: "generated",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
