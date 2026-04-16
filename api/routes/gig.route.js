import express from "express";
import {
    createGig,
    deleteGig,
    getGig,
    getGigs,
    getNewGigs,
    getFeaturedGigs,
    getGigsByCategory,
    getMyGigs
} from "../controllers/gig.controller.js";
import {verifyToken, verifySeller} from "../middleware/jwt.js"

const router = express.Router();

// Protected routes - only sellers can create
router.post("/", verifySeller, createGig);
router.delete("/:id", verifyToken, deleteGig);

// Public routes
router.get("/single/:id", getGig);
router.get("/", getGigs);

// New endpoints
router.get("/new", getNewGigs);              // GET /api/gigs/new?limit=8
router.get("/featured", getFeaturedGigs);    // GET /api/gigs/featured?limit=8
router.get("/category/:cat", getGigsByCategory); // GET /api/gigs/category/books
router.get("/mygigs", verifyToken, getMyGigs);   // GET /api/gigs/mygigs (seller's own)

export default router;