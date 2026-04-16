import createError from "../utils/createError.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import axios from "axios";

export const createMessage = async (req, res, next) => {
  const newMessage = new Message({
    conversationId: req.body.conversationId,
    userId: req.userId,
    desc: req.body.desc,
  });
  try {
    const convo = await Conversation.findOne({ id: req.body.conversationId });
    if (!convo) return next(createError(404, "Conversation not found!"));

    // Check expiration
    if (convo.isLocked || (convo.expiresAt && new Date() > convo.expiresAt)) {
      return next(createError(403, "This conversation has expired and is now locked."));
    }

    const savedMessage = await newMessage.save();
    const updatedConvo = await Conversation.findOneAndUpdate(
      { id: req.body.conversationId },
      {
        $set: {
          readBySeller: req.isSeller,
          readByBuyer: !req.isSeller,
          lastMessage: req.body.desc,
        },
      },
      { new: true }
    );

    // BROADCAST TO GO CHAT SERVICE
    try {
      const recipientId = req.isSeller ? updatedConvo.buyerId : updatedConvo.sellerId;
      await axios.post("http://localhost:8801/broadcast", {
        to: recipientId,
        payload: {
          ...savedMessage._doc,
          isLive: true
        }
      });
    } catch (broadcastErr) {
      console.error("Broadcast failed:", broadcastErr.message);
      // Don't fail the request if broadcast fails, just log it.
    }

    res.status(201).send(savedMessage);
  } catch (err) {
    next(err);
  }
};
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id });
    res.status(200).send(messages);
  } catch (err) {
    next(err);
  }
};