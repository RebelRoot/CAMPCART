import express from "express";
import { deleteUser, getUser, updateUser, getVerifiedStores, searchUsers, updateUserRole } from "../controllers/user.controller.js";
import { verifyToken, verifyAuthority } from "../middleware/jwt.js";

const router = express.Router();

router.get("/verified", getVerifiedStores);  // List all verified stores
router.get("/search", verifyToken, searchUsers); // Admin/Root/Giga can search
router.put("/:id/role", verifyToken, updateUserRole); // Update role (protected by hierarchy logic in controller)
router.delete("/:id", verifyToken, deleteUser);
router.put("/:id", verifyToken, updateUser);  // Update profile (authenticated)
router.get("/:id", getUser);  // Public - anyone can view user profiles


export default router;
