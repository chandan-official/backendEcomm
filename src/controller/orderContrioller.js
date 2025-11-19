import order from "../models/orderModel.js";

// Create a new order
export const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

  try {
    const newOrder = new order({
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: "Pending",
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: "Order created", order: savedOrder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get user orders
export const getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✏️ Update order status
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const existingOrder = await order.findById(orderId);
    if (!existingOrder)
      return res.status(404).json({ message: "Order not found" });

    existingOrder.status = status;
    const updatedOrder = await existingOrder.save();

    return res.status(200).json({
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🗑️ Clear entire cart
export const clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
