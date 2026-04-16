import User from "../models/user.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import createError from "../utils/createError.js";

// Get user's Camp Cash balance
export const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return next(createError(404, "User not found!"));

    res.status(200).json({
      balance: user.campCash || 0,
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

// Send Camp Cash to another user
export const sendMoney = async (req, res, next) => {
  try {
    const { receiverUsername, amount, description } = req.body;

    if (!receiverUsername || !amount || amount <= 0) {
      return next(createError(400, "Receiver username and valid amount required!"));
    }

    // Find sender
    const sender = await User.findById(req.userId);
    if (!sender) return next(createError(404, "Sender not found!"));

    // Find receiver
    const receiver = await User.findOne({ username: receiverUsername });
    if (!receiver) return next(createError(404, "Receiver not found!"));

    // Cannot send to self
    if (sender._id.toString() === receiver._id.toString()) {
      return next(createError(400, "Cannot send money to yourself!"));
    }

    // Check sender balance
    if (sender.campCash < amount) {
      return next(createError(400, "Insufficient Camp Cash balance!"));
    }

    // Update balances
    sender.campCash -= amount;
    receiver.campCash = (receiver.campCash || 0) + amount;

    await sender.save();
    await receiver.save();

    // Create transaction record for sender
    const senderTransaction = new WalletTransaction({
      senderId: sender._id,
      receiverId: receiver._id,
      amount: amount,
      type: "send",
      status: "completed",
      description: description || `Sent to ${receiverUsername}`,
    });

    // Create transaction record for receiver
    const receiverTransaction = new WalletTransaction({
      senderId: sender._id,
      receiverId: receiver._id,
      amount: amount,
      type: "receive",
      status: "completed",
      description: description || `Received from ${sender.username}`,
    });

    await senderTransaction.save();
    await receiverTransaction.save();

    res.status(200).json({
      message: `Successfully sent ₹${amount} to ${receiverUsername}`,
      newBalance: sender.campCash,
      transaction: senderTransaction,
    });
  } catch (err) {
    next(err);
  }
};

// Add money to Camp Cash (for testing/demo purposes)
export const addMoney = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return next(createError(400, "Valid amount required!"));
    }

    const user = await User.findById(req.userId);
    if (!user) return next(createError(404, "User not found!"));

    // Add money
    user.campCash = (user.campCash || 0) + amount;
    await user.save();

    // Create transaction record
    const transaction = new WalletTransaction({
      senderId: "system",
      receiverId: user._id,
      amount: amount,
      type: "add_money",
      status: "completed",
      description: "Added money to Camp Cash",
    });

    await transaction.save();

    res.status(200).json({
      message: `Successfully added ₹${amount}`,
      newBalance: user.campCash,
      transaction,
    });
  } catch (err) {
    next(err);
  }
};

// Get transaction history
export const getTransactionHistory = async (req, res, next) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;

    const query = {
      $or: [{ senderId: req.userId }, { receiverId: req.userId }],
    };

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get user details for each transaction
    const enrichedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const isSender = tx.senderId === req.userId;
        const otherUserId = isSender ? tx.receiverId : tx.senderId;

        let otherUser = null;
        if (otherUserId !== "system") {
          otherUser = await User.findById(otherUserId).select("username img");
        }

        return {
          ...tx._doc,
          isSender,
          otherUser: otherUser
            ? { id: otherUser._id, username: otherUser.username, img: otherUser.img }
            : { username: "System", img: null },
        };
      })
    );

    const total = await WalletTransaction.countDocuments(query);

    res.status(200).json({
      transactions: enrichedTransactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get user by username (for sending money)
export const searchUser = async (req, res, next) => {
  try {
    const { username } = req.query;

    if (!username) {
      return next(createError(400, "Username query required!"));
    }

    const users = await User.find({
      username: { $regex: username, $options: "i" },
    })
      .select("username img college")
      .limit(10);

    // Exclude current user
    const filteredUsers = users.filter((u) => u._id.toString() !== req.userId);

    res.status(200).json(filteredUsers);
  } catch (err) {
    next(err);
  }
};
