import Order from "../models/orderModel.js";

// ============================
// GET ALL ORDERS (ADMIN ACCESS)
// ============================
export const getAlladminOrders = async (req, res) => {
  try {
    // Optionally filter only admin orders using query param
    const filter = req.query.adminOnly === "true" ? { isAdminOrder: true } : {};

    const orders = await Order.find(filter)
      .populate("user", "name email") // populate user info
      .populate("vendorId", "name email") // populate vendor info if any
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Admin getAllOrders error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching orders", err });
  }
};

// ======================================
// UPDATE ORDER STATUS (ADMIN CAN UPDATE)
// ======================================
export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "confirmed",
      "packed",
      "in_transit",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // Update status and track history
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: "admin",
      updatedAt: new Date(),
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    console.error("Admin updateOrderStatus error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error updating order status", err });
  }
};
