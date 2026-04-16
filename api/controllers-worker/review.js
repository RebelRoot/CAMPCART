import db from '../utils/mongodb.js';
import createError from '../utils/createError.js';

export const createReview = async (c) => {
  const isSeller = c.get('isSeller');
  const userId = c.get('userId');
  const body = await c.req.json();
  const env = c.env;

  if (isSeller) throw createError(403, "Sellers can't create a review!");

  const reviews = db('reviews', env);
  const gigs = db('gigs', env);

  const existingReview = await reviews.findOne({
    gigId: body.gigId,
    userId: userId,
  });

  if (existingReview) throw createError(403, "You have already created a review for this gig!");

  const newReview = {
    userId,
    gigId: body.gigId,
    desc: body.desc,
    star: body.star,
    createdAt: new Date(),
  };

  const savedReview = await reviews.insertOne(newReview);

  await gigs.findByIdAndUpdate(body.gigId, {
    $inc: { totalStars: body.star, starNumber: 1 },
  });

  return c.json(savedReview, 201);
};

export const getReviews = async (c) => {
  const gigId = c.req.param('gigId');
  const reviews = db('reviews', c.env);
  const result = await reviews.find({ gigId });
  return c.json(result, 200);
};
