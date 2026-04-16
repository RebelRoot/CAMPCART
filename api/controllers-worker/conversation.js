import db from '../utils/mongodb.js';
import createError from '../utils/createError.js';

export const createConversation = async (c) => {
  const userId = c.get('userId');
  const isSeller = c.get('isSeller');
  const body = await c.req.json();
  const env = c.env;
  const conversations = db('conversations', env);

  const baseId = isSeller ? userId + body.to : body.to + userId;
  const orderId = body.orderId;
  const conversationId = orderId ? `${baseId}_${orderId}` : baseId;

  const newConversation = {
    id: conversationId,
    sellerId: isSeller ? userId : body.to,
    buyerId: isSeller ? body.to : userId,
    readBySeller: isSeller,
    readByBuyer: !isSeller,
    orderId: orderId || null,
    gigId: body.gigId || null,
    chatAccess: {
      buyerCanMessage: false,
      sellerCanMessage: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await conversations.insertOne(newConversation);
  return c.json(newConversation, 201);
};

export const getSingleConversation = async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const conversations = db('conversations', c.env);

  const conversation = await conversations.findOne({ id });
  if (!conversation) throw createError(404, "Not found!");

  // Logic for chat access
  let timeRemaining = 0;
  let isChatOpen = false;
  let canUserMessage = false;

  if (conversation.chatAccess?.chatCloseAt) {
    const now = new Date();
    const closeAt = new Date(conversation.chatAccess.chatCloseAt);
    timeRemaining = Math.max(0, closeAt - now);
    isChatOpen = timeRemaining > 0 && conversation.chatAccess.buyerCanMessage;
  }

  const isSeller = conversation.sellerId === userId;
  const isBuyer = conversation.buyerId === userId;

  if (isSeller) {
    canUserMessage = conversation.chatAccess?.sellerCanMessage !== false;
  } else if (isBuyer) {
    canUserMessage = conversation.chatAccess?.buyerCanMessage && isChatOpen;
  }

  const response = {
    ...conversation,
    timeRemaining,
    isChatOpen,
    canUserMessage,
    userRole: isSeller ? 'seller' : isBuyer ? 'buyer' : 'unknown',
  };

  return c.json(response, 200);
};

export const getConversations = async (c) => {
  const userId = c.get('userId');
  const conversations = db('conversations', c.env);

  const result = await conversations.find({
    $or: [{ sellerId: userId }, { buyerId: userId }]
  }, { sort: { updatedAt: -1 } });

  return c.json(result, 200);
};

export const updateConversation = async (c) => {
  const userId = c.get('userId');
  const isSeller = c.get('isSeller');
  const id = c.req.param('id');
  const conversations = db('conversations', c.env);

  await conversations.updateOne(
    { id },
    { $set: isSeller ? { readBySeller: true } : { readByBuyer: true } }
  );

  return c.text("Updated", 200);
};
