import express from "express";
import {
  verifyUserToken,
  validateCartData,
} from "../middleware/cartMiddleware.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", verifyUserToken, validateCartData, addToCart);
router.get("/", verifyUserToken, getCart);
router.put("/:itemId", verifyUserToken, validateCartData, updateCartItem);
router.delete("/:itemId", verifyUserToken, removeCartItem);
router.delete("/clear", verifyUserToken, clearCart);

export default router;
