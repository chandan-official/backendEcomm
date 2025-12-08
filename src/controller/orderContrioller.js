import Order from "../models/orderModel.js";

export const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

  try {
    // Map items from payload to match Order schema
    const orderItems = items.map((item) => ({
      productId: item.product, // frontend sends product ID
      name: item.name || "", // snapshot name
      image: item.image || "", // snapshot image
      quantity: item.qty || 1,
      price: item.price || 0,
    }));

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      status: "pending",
      statusHistory: [{ status: "pending", timestamp: new Date() }],
      paymentInfo: { method: paymentMethod || "COD" },
      address: shippingAddress, // make sure it's an object with fullName, phone, etc.
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ message: "Order created", order: savedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get user orders
export const getUserOrders = async (req, res) => {
  const userId = req.user.id; // comes from verifyUserToken
  try {
    const userOrders = await Order.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(userOrders);
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

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const existingOrder = await order.findById(orderId);
    if (!existingOrder)
      return res.status(404).json({ message: "Order not found" });

    existingOrder.status = "cancelled";
    const updatedOrder = await existingOrder.save();

    return res.status(200).json({
      message: "Order cancelled",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
