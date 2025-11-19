import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import Invoice from "../models/InvoiceModel.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------- 1️⃣ Create Razorpay Order ----------
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: orderId,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Razorpay order creation failed",
      error,
    });
  }
};

// ---------- 2️⃣ Verify Payment + Auto-Generate Invoice ----------
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // ✅ Payment Verified — update order status
    const order = await Order.findById(orderId).populate("userId");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "paid";
    order.paymentId = razorpay_payment_id;
    await order.save();

    // ✅ Generate and save invoice
    const user = order.userId;
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceDir = path.join("invoices");
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

    const invoicePath = path.join(invoiceDir, `${invoiceNumber}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(invoicePath));

    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();
    doc.text(`Invoice Number: ${invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Payment ID: ${razorpay_payment_id}`);
    doc.moveDown();
    doc.text(`Customer: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Phone: ${user.phone}`);
    doc.moveDown();
    doc.text("Items:");
    order.items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name} - ₹${item.price} × ${item.quantity}`);
    });
    doc.moveDown();
    doc.text(`Total Amount: ₹${order.total}`, { align: "right" });
    doc.end();

    const newInvoice = new Invoice({
      orderId,
      userId: user._id,
      invoiceNumber,
      amount: order.total,
      paymentId: razorpay_payment_id,
      pdfUrl: invoicePath,
    });
    await newInvoice.save();

    res.status(200).json({
      success: true,
      message: "Payment verified & invoice generated",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
