import express from "express";

import {
  getAlladminOrders,
  updateAdminOrderStatus,
} from "../controller/AdminOrderController.js";
import { verifyToken, verifyAdmin } from "../token-config/verifyToken.js";

const router = express.Router();

// Users

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
