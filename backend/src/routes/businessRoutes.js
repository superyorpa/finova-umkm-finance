import express from "express";
import {
    getBusinessProfile,
    updateBusinessProfile
} from "../controllers/businessController.js";

import { authMiddleware } from "../../middleware/authMiddleware.js";


const router = express.Router();


router.get(
    "/profile",
    authMiddleware,
    getBusinessProfile
);

router.put(
    "/profile",
    authMiddleware,
    updateBusinessProfile
);


export default router;
