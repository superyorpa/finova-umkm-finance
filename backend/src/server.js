import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import businessRoutes from "./routes/businessRoutes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    message: "Finova API Running"
  });
});

app.get("/api/profile", authMiddleware, (req,res)=>{

    res.json({
        id: req.user.id,
        email: req.user.email
    });

});

app.use(
    "/api/business",
    businessRoutes
);


app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});