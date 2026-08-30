import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import businessRoutes from "./routes/businessRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Finova API Running",
  });
});

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
  });
});

app.use("/api/business", businessRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/products", productRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/insights", insightRoutes);

app.use("/api/auth", authRoutes);

export default app;