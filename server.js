import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./src/config/db.js";
import router from "./src/routes/authRoute.js";
import invoiceRouter from "./src/routes/invoiceRoutes.js";
// import paymentRouter from "./src/routes/paymentRoutes.js";
import productRouter from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/api/auth", router);
app.use("/api/invoice", invoiceRouter);
// app.use("/api/payment", paymentRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export default app;
