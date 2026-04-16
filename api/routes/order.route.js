import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { 
  getOrders, 
  getOrder,
  confirm, 
  createCodOrder, 
  sellerConfirmOrder, 
  submitP2PProof, 
  sellerVerifyP2P, 
  createP2POrder,
  markOrderShipped,
  markOrderCompleted,
  getBill
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", verifyToken, getOrders);
router.get("/single/:id", verifyToken, getOrder); // Get single order for tracking
router.get("/bill/:id", verifyToken, getBill); // Get bill for order
router.post("/create-payment-intent/:id", verifyToken, createP2POrder); // Replaced intent with P2P creation
router.post("/create-cod/:id", verifyToken, createCodOrder);
router.put("/confirm/:id", verifyToken, sellerConfirmOrder); // Seller confirms COD order
router.put("/submit-p2p-proof/:id", verifyToken, submitP2PProof); // Buyer submits proof
router.put("/verify-p2p/:id", verifyToken, sellerVerifyP2P); // Seller verifies P2P
router.put("/ship/:id", verifyToken, markOrderShipped); // Seller marks as shipped (Phase 2)
router.put("/complete/:id", verifyToken, markOrderCompleted); // Mark as completed (Phase 3)
router.put("/", verifyToken, confirm); // Hyperswitch confirmation

export default router;