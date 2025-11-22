// token-config/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// restrict access to vendors only
export const verifyVendor = (req, res, next) => {
  if (req.user.role !== "vendor") {
    return res.status(403).json({
      message: "Access denied. Vendors only.",
    });
  }
  next();
};

// restrict access to admins only
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }
  next();
};

export default verifyToken;
