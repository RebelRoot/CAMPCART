import db from '../utils/mongodb.js';
import createError from '../utils/createError.js';

export const createP2POrder = async (c) => {
  const env = c.env;
  const userId = c.get('userId');
  const gigId = c.req.param('id');
  
  const gigs = db('gigs', env);
  const orders = db('orders', env);
  const conversations = db('conversations', env);
  const messages = db('messages', env);

  const gig = await gigs.findById(gigId);
  if (!gig) throw createError(404, "Gig not found!");

  // Check existing
  let order = await orders.findOne({
    gigId: { "$oid": gigId },
    buyerId: userId,
    status: "pending_payment"
  });

  if (!order) {
    const newOrder = {
      gigId: { "$oid": gigId },
      img: gig.cover,
      title: gig.title,
      buyerId: userId,
      sellerId: gig.userId,
      price: gig.price,
      paymentMethod: "prepaid",
      status: "pending_payment",
      createdAt: new Date(),
    };
    
    order = await orders.insertOne(newOrder);

    // Notify
    const convId = order.sellerId + order.buyerId;
    await conversations.updateOne(
      { id: convId },
      {
        $set: {
          lastMessage: `New Prepaid Order: ${order.title}`,
          readBySeller: false,
          readByBuyer: true,
        }
      },
      { upsert: true }
    );

    await messages.insertOne({
      conversationId: convId,
      userId: userId,
      desc: `📦 NEW ORDER: I started a prepaid order for "${order.title}". Please check the Orders tab!`,
      createdAt: new Date(),
    });
  }

  return c.text(order._id, 200);
};

export const getOrders = async (c) => {
  const userId = c.get('userId');
  const orders = db('orders', c.env);

  const result = await orders.find({
    $or: [{ sellerId: userId }, { buyerId: userId }],
  }, { sort: { createdAt: -1 } });

  return c.json(result, 200);
};

export const sellerConfirmOrder = async (c) => {
  const orderId = c.req.param('id');
  const userId = c.get('userId');
  const orders = db('orders', c.env);
  const transactions = db('transactions', c.env);

  const order = await orders.findById(orderId);
  if (!order) throw createError(404, "Order not found!");
  if (order.sellerId !== userId) throw createError(403, "Not authorized!");

  await orders.findByIdAndUpdate(orderId, { $set: { status: "processing" } });

  await transactions.insertOne({
    userId: order.buyerId,
    orderId: { "$oid": orderId },
    amount: order.price,
    type: "debit",
    paymentMethod: "cod",
    status: "completed",
    desc: `COD Order confirmed: ${order.title}`,
    createdAt: new Date(),
  });

  return c.text("Order confirmed and invoice generated.", 200);
};

export const getOrder = async (c) => {
  const orderId = c.req.param('id');
  const userId = c.get('userId');
  const orders = db('orders', c.env);

  const order = await orders.findById(orderId);
  if (!order) throw createError(404, "Order not found!");
  if (order.buyerId !== userId && order.sellerId !== userId) throw createError(403, "Not authorized!");

  return c.json(order, 200);
};
