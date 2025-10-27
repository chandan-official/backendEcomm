import express from "express";
import { registerUser, loginUser } from "../controller/authController.js";
import ValidateUser from "../middleware/ValidateUser.js";
import validateLogin from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  (req, res, next) => {
    console.log("Route hit");
    next();
  },
  ValidateUser,
  (req, res, next) => {
    console.log("Middleware passed");
    next();
  },
  registerUser
);

router.post(
  "/login",
  (req, res, next) => {
    console.log("Login route hit");
    next();
  },
  validateLogin,
  (req, res, next) => {
    console.log("Login middleware passed");
    next();
  },
  loginUser
);

export default router;
