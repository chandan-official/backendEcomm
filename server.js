import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./src/config/db.js";

// Routes
import router from "./src/routes/authRoute.js";
import invoiceRouter from "./src/routes/invoiceRoutes.js";
import productRouter from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import vendorRoutes from "./src/routes/vendorRoutes.js";

dotenv.config();

const app = express();

// Needed to detect https when behind NGINX/Hostinger proxy
app.set("trust proxy", 1);

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: "*", // change later to your frontend domain
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Connect DB
connectDB()
  .then(() => console.log("DB connected successfully"))
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", router);
app.use("/api/invoice", invoiceRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);

// Root
app.get("/", (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  res.send(`API running at: ${baseUrl}`);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ success: false, message: "Server Error" });
});

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;

