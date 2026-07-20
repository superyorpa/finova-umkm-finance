import express from "express";
import {
    getBusinessProfile
} from "../controllers/businessController.js";

import { authMiddleware } from "../../middleware/authMiddleware.js";


const router = express.Router();


router.get(
    "/profile",
    authMiddleware,
    getBusinessProfile
);


export default router;