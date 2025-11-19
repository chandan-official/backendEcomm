const validateAddress = (req, res, next) => {
  const { street, city, state, postalCode, phone } = req.body;

  if (!street || !city || !state || !postalCode || !phone) {
    return res.status(400).json({ message: "All address fields are required" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  if (!/^\d{6}$/.test(postalCode)) {
    return res.status(400).json({ message: "Invalid postal code" });
  }

  next();
};

export default validateAddress;
