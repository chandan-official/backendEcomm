import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    // 1️⃣ Fetch product details
    const productData = await Product.findById(productId);
    if (!productData)
      return res.status(404).json({ message: "Product not found" });

    // 2️⃣ Find user's cart or create new
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, cartItems: [] });

    // 3️⃣ Check if product already exists in cart
    const existingItem = cart.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += quantity; // Update quantity
    } else {
      cart.cartItems.push({
        product: productId,
        qty: quantity,
        name: productData.name,
        price: productData.price,
        image: productData.images?.[0] || "",
      });
    }

    // 4️⃣ Save cart
    await cart.save();

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "cartItems.product"
    );

    if (!cart) {
      return res.status(200).json({ items: [] }); // empty cart
    }

    res.status(200).json({ items: cart.cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✏️ Update item quantity
export const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.cartItems.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.qty = quantity;
    await cart.save();

    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🗑️ Remove single item
export const removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params; // _id of cart item

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Filter out the cart item by its _id
    const originalLength = cart.cartItems.length;
    cart.cartItems = cart.cartItems.filter(
      (item) => item._id.toString() !== itemId
    );

    if (cart.cartItems.length === originalLength) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cart.save();

    res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error",
        error: error instanceof Error ? error.message : error,
      });
  }
};

// 🧹 Clear all items
export const clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    await Cart.findOneAndUpdate({ user: userId }, { $set: { cartItems: [] } });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
