import express from "express";
import { verifyUserToken } from "../middleware/cartMiddleware.js";

import {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controller/orderContrioller.js";

const router = express.Router();

// Create a new order
router.post("/create", verifyUserToken, createOrder);

// Get orders for a specific user
router.get("/user", verifyUserToken, getUserOrders);

// Update order status
router.put("/update-status/:orderId", verifyUserToken, updateOrderStatus);
// Cancel an order
router.put("/cancel/:orderId", verifyUserToken, cancelOrder);

export default router;
