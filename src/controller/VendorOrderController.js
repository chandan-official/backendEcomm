// vendorOrderController.js
import Order from "../models/orderModel.js";

// Get all orders for logged-in vendor
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const orders = await Order.find({ vendorId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: "Error fetching vendor orders", err });
  }
};

// Update status (only vendor of this order can update)
export const updateVendorOrderStatus = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { id } = req.params;
    const { status } = req.body;

    const allowed = [
      "confirmed",
      "packed",
      "in_transit",
      "delivered",
      "cancelled",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.vendorId.toString() !== vendorId) {
      return res.status(403).json({ message: "Unauthorized vendor" });
    }

    order.status = status;
    order.statusHistory.push({ status });

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating status", err });
  }
};
