export const validatePaymentRequest = (req, res, next) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Invalid payment amount" });
  }

  next();
};
