import express from "express";
import { getSchemes, syncSchemes } from "../controllers/scheme.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", getSchemes);
router.post("/sync", verifyToken, syncSchemes);

export default router;
