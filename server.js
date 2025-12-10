import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./src/config/db.js";

// Routes
import router from "./src/routes/authRoute.js";
import productRouter from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import vendorRoutes from "./src/routes/vendorRoutes.js";
import Cartrouter from "./src/routes/cartRoutes.js";
import OrderRoutes from "./src/routes/orderRoutes.js";
import AddressRoute from "./src/routes/addressRoute.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// 🔥 FIXED CORS (NO MORE BLOCKED GET CALLS)
import cors from "cors";

app.use(cors({
  origin: ["http://localhost:3000", "http://your-frontend-domain.com"],
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","x-api-key"],
  credentials: true
}));


app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// DB
connectDB()
  .then(() => console.log("DB connected successfully"))
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });

// ROUTES
app.use("/api/auth", router);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/cart", Cartrouter);
app.use("/api/orders", OrderRoutes);
app.use("/api/addresses", AddressRoute);

// Test Route
app.get("/", (req, res) => {
  res.send(`API running`);
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ success: false, message: "Server Error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
