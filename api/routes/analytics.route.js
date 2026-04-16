import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { getSellerAnalytics, getBuyerAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/seller", verifyToken, getSellerAnalytics);
router.get("/buyer", verifyToken, getBuyerAnalytics);

export default router;
