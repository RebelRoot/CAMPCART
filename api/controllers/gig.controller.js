import Gig from "../models/gig.model.js";
import createError from "../utils/createError.js";

export const createGig = async (req, res, next) => {
  // Check if user is seller
  if (!req.isSeller && req.role !== 'seller') {
    return next(createError(403, "Only sellers can create a listing! Register as a seller first."));
  }

  const newGig = new Gig({
    ...req.body,
    userId: req.userId,
  });

  try {
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    next(err);
  }
};
export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (gig.userId !== req.userId)
      return next(createError(403, "You can delete only your gig!"));

    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};
export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return next(createError(404, "Gig not found!"));
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }
};
export const getGigs = async (req, res, next) => {
  const q = req.query;
  
  // Build filters
  const filters = {};
  
  if (q.userId) filters.userId = q.userId;
  if (q.cat) filters.cat = q.cat;
  
  // Price filter - parse as integers
  const minPrice = q.min ? parseInt(q.min) : null;
  const maxPrice = q.max ? parseInt(q.max) : null;
  
  if (minPrice !== null || maxPrice !== null) {
    filters.price = {};
    if (minPrice !== null) filters.price.$gte = minPrice;  // greater than or equal
    if (maxPrice !== null) filters.price.$lte = maxPrice;  // less than or equal
  }
  
  // Search filter
  if (q.search) {
    filters.title = { $regex: q.search, $options: "i" };
  }
  
  try {
    // Default sort by createdAt (newest) if no sort specified
    const sortField = q.sort || "createdAt";
    const sortOrder = q.order === "asc" ? 1 : -1;
    let query = Gig.find(filters).sort({ [sortField]: sortOrder });
    
    // Apply limit if provided
    if (q.limit) {
      query = query.limit(parseInt(q.limit));
    }
    
    const gigs = await query;
    res.status(200).send(gigs);
  } catch (err) {
    next(err);
  }
};

// Get newly listed items (for homepage)
export const getNewGigs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const newGigs = await Gig.find({ isActive: true })
      .sort({ createdAt: -1 })  // Newest first
      .limit(limit)
      .populate('userId', 'username img college hostel');  // Include seller info
    
    res.status(200).send(newGigs);
  } catch (err) {
    next(err);
  }
};

// Get featured/trending items
export const getFeaturedGigs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    // Featured = high rating + active
    const featuredGigs = await Gig.find({ isActive: true })
      .sort({ 
        totalStars: -1,   // High rated first
        sales: -1,        // Then by sales
        createdAt: -1     // Then newest
      })
      .limit(limit);
    
    res.status(200).send(featuredGigs);
  } catch (err) {
    next(err);
  }
};

// Get items by category
export const getGigsByCategory = async (req, res, next) => {
  try {
    const { cat } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const gigs = await Gig.find({ 
      cat: cat,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.status(200).send(gigs);
  } catch (err) {
    next(err);
  }
};

// Get seller's own gigs
export const getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    res.status(200).send(gigs);
  } catch (err) {
    next(err);
  }
};
