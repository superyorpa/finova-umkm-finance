import express from "express";
import { getInsights } from "../controllers/insightController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getInsights);

export default router;
