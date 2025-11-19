import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import Invoice from "../models/InvoiceModel.js";
import Order from "../models/orderModel.js";

export const generateInvoice = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;

    const order = await Order.findById(orderId).populate("userId");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const user = order.userId;
    const invoiceNumber = `INV-${Date.now()}`;

    // Ensure invoices folder exists
    const invoiceDir = path.join("invoices");
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }

    const invoicePath = path.join(invoiceDir, `${invoiceNumber}.pdf`);

    // Generate PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(invoicePath));

    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Order ID: ${orderId}`);
    doc.text(`Payment ID: ${paymentId}`);
    doc.moveDown();

    // User Info
    doc.text(`Customer: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Phone: ${user.phone}`);
    doc.moveDown();

    // Order Items
    doc.text("Order Items:");
    order.items.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name} - ₹${item.price} x ${item.quantity}`);
    });

    doc.moveDown();
    doc.text(`Total Amount: ₹${order.total}`, { align: "right" });

    doc.end();

    // Save invoice info in DB
    const newInvoice = new Invoice({
      orderId,
      userId: user._id,
      invoiceNumber,
      amount: order.total,
      paymentId,
      pdfUrl: invoicePath,
    });

    await newInvoice.save();

    res.status(200).json({
      success: true,
      message: "Invoice generated successfully",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Invoice generation failed:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Fetch all invoices of a user
export const getUserInvoices = async (req, res) => {
  try {
    const userId = req.params.userId;
    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoices" });
  }
};
