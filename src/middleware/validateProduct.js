// src/middleware/validateProduct.js
export const validateProduct = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ message: "Product name is required" });
  }
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    return res.status(400).json({ message: "Valid price is required" });
  }

  // attributes can be sent as JSON string from form-data; if so, try parse
  if (req.body.attributes && typeof req.body.attributes === "string") {
    try {
      req.body.attributes = JSON.parse(req.body.attributes);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "attributes must be a valid JSON object" });
    }
  }

  next();
};
