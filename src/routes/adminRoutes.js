import express from "express";
import {
  getAllUsers,
  updateUserRole,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} from "../controller/adminController.js";

import {
  getAllOrders,
  updateOrderStatus,
} from "../controller/AdminOrderController.js";
import { verifyToken, verifyAdmin } from "../token-config/verifyToken.js";

const router = express.Router();

// Users
router.get(
  "/users",
  auth,
  allowRoles("admin"),
  getAllUsers,
  verifyToken,
  verifyAdmin
);
router.put(
  "/user/:id/role",
  auth,
  allowRoles("admin"),
  updateUserRole,
  verifyToken,
  verifyAdmin
);

router.get(
  "/orders",
  auth,
  allowRoles("admin"),
  getAllOrders,
  verifyToken,
  verifyAdmin
);
router.put(
  "/order/:id/status",
  auth,
  allowRoles("admin"),
  updateOrderStatus,
  verifyToken,
  verifyAdmin
);
router.get(
  "/dashboard-stats",
  auth,
  allowRoles("admin"),
  getDashboardStats,
  verifyToken,
  verifyAdmin
);

export default router;
