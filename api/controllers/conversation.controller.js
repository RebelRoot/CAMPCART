import createError from "../utils/createError.js";
import Conversation from "../models/conversation.model.js";

export const createConversation = async (req, res, next) => {
  // Include orderId in conversation ID if provided, to ensure unique conversation per order
  const baseId = req.isSeller ? req.userId + req.body.to : req.body.to + req.userId;
  const orderId = req.body.orderId;
  const conversationId = orderId ? `${baseId}_${orderId}` : baseId;
  
  const newConversation = new Conversation({
    id: conversationId,
    sellerId: req.isSeller ? req.userId : req.body.to,
    buyerId: req.isSeller ? req.body.to : req.userId,
    readBySeller: req.isSeller,
    readByBuyer: !req.isSeller,
    orderId: orderId || null,
    gigId: req.body.gigId || null,
    // Chat closed by default - buyer must submit proof first
    chatAccess: {
      buyerCanMessage: false,
      sellerCanMessage: true,
    },
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(201).send(savedConversation);
  } catch (err) {
    next(err);
  }
};

// Submit payment proof (buyer)
export const submitProof = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Conversation not found!"));

    // Only buyer can submit proof
    if (conversation.buyerId !== req.userId) {
      return next(createError(403, "Only buyer can submit proof!"));
    }

    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          'proof.screenshot': req.body.screenshot,
          'proof.utr': req.body.utr,
          'proof.submittedAt': new Date(),
          'proof.status': 'pending',
        },
      },
      { new: true }
    );

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

// Verify/reject proof (seller)
export const verifyProof = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Conversation not found!"));

    // Only seller can verify
    if (conversation.sellerId !== req.userId) {
      return next(createError(403, "Only seller can verify proof!"));
    }

    const { status, durationMinutes = 60 } = req.body; // 'verified' or 'rejected'

    const updateData = {
      'proof.status': status,
    };

    // If verified, enable chat for buyer with time duration
    if (status === 'verified') {
      const now = new Date();
      updateData['chatAccess.buyerCanMessage'] = true;
      updateData['chatAccess.chatOpenAt'] = now;
      updateData['chatAccess.chatCloseAt'] = new Date(now.getTime() + durationMinutes * 60000);
      updateData['chatAccess.durationMinutes'] = durationMinutes;
    }

    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true }
    );

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

// Enable/disable chat with duration (seller only)
export const toggleChatAccess = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Conversation not found!"));

    // Only seller can control chat access
    if (conversation.sellerId !== req.userId) {
      return next(createError(403, "Only seller can control chat access!"));
    }

    const { enable, durationMinutes = 60 } = req.body;
    const now = new Date();

    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          'chatAccess.buyerCanMessage': enable,
          'chatAccess.chatOpenAt': enable ? now : null,
          'chatAccess.chatCloseAt': enable ? new Date(now.getTime() + durationMinutes * 60000) : null,
          'chatAccess.durationMinutes': durationMinutes,
        },
      },
      { new: true }
    );

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

// Add custom template (seller only)
export const addTemplate = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Conversation not found!"));

    if (conversation.sellerId !== req.userId) {
      return next(createError(403, "Only seller can add templates!"));
    }

    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      { $push: { templates: req.body.message } },
      { new: true }
    );

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          // readBySeller: true,
          // readByBuyer: true,
          ...(req.isSeller ? { readBySeller: true } : { readByBuyer: true }),
        },
      },
      { new: true }
    );

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

export const getSingleConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Not found!"));

    // Calculate time remaining for chat
    let timeRemaining = 0;
    let isChatOpen = false;
    let canUserMessage = false;

    if (conversation.chatAccess?.chatCloseAt) {
      const now = new Date();
      const closeAt = new Date(conversation.chatAccess.chatCloseAt);
      timeRemaining = Math.max(0, closeAt - now);
      isChatOpen = timeRemaining > 0 && conversation.chatAccess.buyerCanMessage;
    }

    // Determine if current user can message
    const isSeller = conversation.sellerId === req.userId;
    const isBuyer = conversation.buyerId === req.userId;

    if (isSeller) {
      canUserMessage = conversation.chatAccess?.sellerCanMessage !== false;
    } else if (isBuyer) {
      canUserMessage = conversation.chatAccess?.buyerCanMessage && isChatOpen;
    }

    const response = {
      ...conversation.toObject(),
      timeRemaining,
      isChatOpen,
      canUserMessage,
      userRole: isSeller ? 'seller' : isBuyer ? 'buyer' : 'unknown',
    };

    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    // Show ALL conversations where user is either buyer OR seller
    // This fixes the issue where sellers couldn't see conversations where they are buyers
    const conversations = await Conversation.find({
      $or: [
        { sellerId: req.userId },
        { buyerId: req.userId }
      ]
    }).sort({ updatedAt: -1 });
    res.status(200).send(conversations);
  } catch (err) {
    next(err);
  }
};

// Get all conversations with proof submitted (for seller verification page)
export const getPendingVerifications = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      sellerId: req.userId,
      'proof.status': 'pending',
      'proof.screenshot': { $exists: true },
    }).sort({ 'proof.submittedAt': -1 });

    res.status(200).send(conversations);
  } catch (err) {
    next(err);
  }
};