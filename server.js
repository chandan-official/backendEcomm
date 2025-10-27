import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./src/config/db.js";
import router from "./src/routes/authRoute.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/api/auth", router);

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export default app;
