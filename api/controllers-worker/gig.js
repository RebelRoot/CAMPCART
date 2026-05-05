import db from '../utils/mongodb.js';
import createError from '../utils/createError.js';

export const createGig = async (c) => {
  const isSeller = c.get('isSeller');
  const role = c.get('role');
  const userId = c.get('userId');

  if (!isSeller && role !== 'seller') {
    throw createError(403, "Only sellers can create a listing! Register as a seller first.");
  }

  const body = await c.req.json();
  const gigs = db('gigs', c.env);

  const newGig = {
    ...body,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const savedGig = await gigs.insertOne(newGig);
  return c.json(savedGig, 201);
};

export const deleteGig = async (c) => {
  const gigs = db('gigs', c.env);
  const id = c.req.param('id');
  const userId = c.get('userId');

  const gig = await gigs.findById(id);
  if (!gig) throw createError(404, "Gig not found!");
  if (gig.userId !== userId) throw createError(403, "You can delete only your gig!");

  await gigs.deleteOne({ _id: { "$oid": id } });
  return c.text("Gig has been deleted!", 200);
};

export const getGig = async (c) => {
  const gigs = db('gigs', c.env);
  const gig = await gigs.findById(c.req.param('id'));
  if (!gig) throw createError(404, "Gig not found!");
  return c.json(gig, 200);
};

export const getGigs = async (c) => {
  const q = c.req.query();
  const gigs = db('gigs', c.env);

  const filters = {};
  if (q.userId) filters.userId = q.userId;
  if (q.cat) filters.cat = q.cat;

  const minPrice = q.min ? parseInt(q.min) : null;
  const maxPrice = q.max ? parseInt(q.max) : null;

  if (minPrice !== null || maxPrice !== null) {
    filters.price = {};
    if (minPrice !== null) filters.price.$gte = minPrice;
    if (maxPrice !== null) filters.price.$lte = maxPrice;
  }

  if (q.search) {
    filters.title = { $regex: q.search, $options: "i" };
  }

  const sortField = q.sort || "createdAt";
  const sortOrder = q.order === "asc" ? 1 : -1;
  const limit = q.limit ? parseInt(q.limit) : 100;

  const result = await gigs.find(filters, {
    sort: { [sortField]: sortOrder },
    limit
  });

  return c.json(result, 200);
};

export const getMyGigs = async (c) => {
  const userId = c.get('userId');
  const gigs = db('gigs', c.env);

  const result = await gigs.find({ userId }, {
    sort: { createdAt: -1 }
  });

  return c.json(result, 200);
};
