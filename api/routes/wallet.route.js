import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  getBalance,
  sendMoney,
  addMoney,
  getTransactionHistory,
  searchUser,
} from "../controllers/wallet.controller.js";

const router = express.Router();

// Get balance
router.get("/balance", verifyToken, getBalance);

// Send money
router.post("/send", verifyToken, sendMoney);

// Add money (for testing/demo)
router.post("/add", verifyToken, addMoney);

// Get transaction history
router.get("/history", verifyToken, getTransactionHistory);

// Search user by username
router.get("/search", verifyToken, searchUser);

export default router;
