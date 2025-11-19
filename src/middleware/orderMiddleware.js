// middleware/validateOrderData.js
export const validateOrderData = (req, res, next) => {
  const { items, totalAmount, paymentMode, address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Order must contain at least one item." });
  }

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      return res
        .status(400)
        .json({
          message: "Each item must have a valid productId and quantity.",
        });
    }
  }

  if (!totalAmount || typeof totalAmount !== "number" || totalAmount <= 0) {
    return res
      .status(400)
      .json({ message: "Invalid or missing total amount." });
  }

  if (
    !paymentMode ||
    !["upi", "cod", "wallet", "bank_transfer"].includes(paymentMode)
  ) {
    return res.status(400).json({
      message:
        "Invalid payment mode. Must be one of: upi, cod, wallet, bank_transfer.",
    });
  }

  if (
    !address ||
    typeof address !== "object" ||
    !address.fullName ||
    !address.pincode
  ) {
    return res
      .status(400)
      .json({ message: "Shipping address is incomplete or invalid." });
  }

  next();
};
