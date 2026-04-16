import db from '../utils/mongodb.js';
import createError from '../utils/createError.js';

export const createMessage = async (c) => {
  const userId = c.get('userId');
  const isSeller = c.get('isSeller');
  const body = await c.req.json();
  const env = c.env;
  
  const messages = db('messages', env);
  const conversations = db('conversations', env);

  const convo = await conversations.findOne({ id: body.conversationId });
  if (!convo) throw createError(404, "Conversation not found!");

  // Check expiration if needed
  if (convo.isLocked) {
    throw createError(403, "This conversation is locked.");
  }

  const newMessage = {
    conversationId: body.conversationId,
    userId: userId,
    desc: body.desc,
    createdAt: new Date(),
  };

  const savedMessage = await messages.insertOne(newMessage);
  
  await conversations.updateOne(
    { id: body.conversationId },
    {
      $set: {
        readBySeller: isSeller,
        readByBuyer: !isSeller,
        lastMessage: body.desc,
        updatedAt: new Date(),
      },
    }
  );

  // Broadcast to Go Chat Service (Production URL)
  if (env.CHAT_SERVICE_URL) {
    try {
      const recipientId = isSeller ? convo.buyerId : convo.sellerId;
      await fetch(`${env.CHAT_SERVICE_URL}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientId,
          payload: { ...newMessage, _id: savedMessage._id, isLive: true }
        })
      });
    } catch (err) {
      console.error("Broadcast failed:", err.message);
    }
  }

  return c.json(savedMessage, 201);
};

export const getMessages = async (c) => {
  const id = c.req.param('id');
  const messages = db('messages', c.env);
  const result = await messages.find({ conversationId: id });
  return c.json(result, 200);
};
