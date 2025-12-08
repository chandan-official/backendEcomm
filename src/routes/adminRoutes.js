import express from "express";

import {
  createDefaultAdmin,
  loginAdmin,
  changeAdminPassword,
} from "../controller/adminController.js";
import {
  getAlladminOrders,
  updateAdminOrderStatus,
} from "../controller/AdminOrderController.js";
import { verifyToken, verifyAdmin } from "../token-config/verifyToken.js";

const router = express.Router();

// Users
router.post("/dlogin", createDefaultAdmin);
router.post("/login", loginAdmin);
router.post("/fpassword", changeAdminPassword);

router.post("/admin-orders", getAlladminOrders);

router.get(
  "/admin-orders",

  getAlladminOrders,
  verifyToken,
  verifyAdmin
);
router.put(
  "/order/:id/status",

  updateAdminOrderStatus,
  verifyToken,
  verifyAdmin
);

export default router;
