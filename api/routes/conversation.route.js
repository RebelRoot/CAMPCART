import express from "express";
import {
  createConversation,
  getConversations,
  getSingleConversation,
  updateConversation,
  submitProof,
  verifyProof,
  toggleChatAccess,
  addTemplate,
  getPendingVerifications,
} from "../controllers/conversation.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verifyToken, getConversations);
router.post("/", verifyToken, createConversation);
router.get("/single/:id", verifyToken, getSingleConversation);
router.put("/:id", verifyToken, updateConversation);

// Proof submission (buyer)
router.post("/:id/proof", verifyToken, submitProof);

// Proof verification (seller)
router.put("/:id/verify", verifyToken, verifyProof);

// Chat access control (seller)
router.put("/:id/chat-access", verifyToken, toggleChatAccess);

// Add message template (seller)
router.post("/:id/template", verifyToken, addTemplate);

// Get pending verifications (seller)
router.get("/verifications/pending", verifyToken, getPendingVerifications);

export default router;