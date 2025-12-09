import jwt from "jsonwebtoken";

// ----------------------
// VERIFY TOKEN MIDDLEWARE
// ----------------------
export const verifyToken = (req, res, next) => {
  try {
    let token = null;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    console.log("🔍 BACKEND RECEIVED TOKEN:", token);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user data
    next();
  } catch (err) {
    console.log("❌ Token error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ----------------------
// VERIFY VENDOR ROLE
// ----------------------
export const verifyVendor = (req, res, next) => {
  console.log("🔸 verifyVendor hit");

  if (!req.user) {
    console.log("❌ req.user missing");
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "vendor") {
    console.log("❌ Not vendor role");
    return res.status(403).json({ message: "Access denied. Vendors only." });
  }

  console.log("✔ Vendor OK");
  next();
};
