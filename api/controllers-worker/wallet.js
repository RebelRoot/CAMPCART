import db from '../utils/mongodb.js';
import createError from '../utils/createError.js';

export const getBalance = async (c) => {
  const users = db('users', c.env);
  const user = await users.findById(c.get('userId'));
  if (!user) throw createError(404, "User not found!");

  return c.json({
    balance: user.campCash || 0,
    userId: user._id,
  }, 200);
};

export const sendMoney = async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { receiverUsername, amount, description } = body;
  const env = c.env;

  if (!receiverUsername || !amount || amount <= 0) {
    throw createError(400, "Receiver username and valid amount required!");
  }

  const users = db('users', env);
  const walletTransactions = db('wallettransactions', env);

  const sender = await users.findById(userId);
  const receiver = await users.findOne({ username: receiverUsername });

  if (!sender) throw createError(404, "Sender not found!");
  if (!receiver) throw createError(404, "Receiver not found!");
  if (sender._id.toString() === receiver._id.toString()) throw createError(400, "Cannot send money to yourself!");
  if ((sender.campCash || 0) < amount) throw createError(400, "Insufficient Camp Cash balance!");

  // Update balances
  await users.findByIdAndUpdate(sender._id.toString(), { $inc: { campCash: -amount } });
  await users.findByIdAndUpdate(receiver._id.toString(), { $inc: { campCash: amount } });

  const txData = {
    senderId: sender._id,
    receiverId: receiver._id,
    amount,
    status: "completed",
    createdAt: new Date(),
  };

  await walletTransactions.insertOne({ ...txData, type: "send", description: description || `Sent to ${receiverUsername}` });
  await walletTransactions.insertOne({ ...txData, type: "receive", description: description || `Received from ${sender.username}` });

  return c.json({
    message: `Successfully sent ₹${amount} to ${receiverUsername}`,
    newBalance: sender.campCash - amount,
  }, 200);
};

export const addMoney = async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { amount } = body;
  const env = c.env;

  if (!amount || amount <= 0) throw createError(400, "Valid amount required!");

  const users = db('users', env);
  const walletTransactions = db('wallettransactions', env);

  await users.findByIdAndUpdate(userId, { $inc: { campCash: amount } });

  const updatedUser = await users.findById(userId);

  const transaction = {
    senderId: "system",
    receiverId: { "$oid": userId },
    amount,
    type: "add_money",
    status: "completed",
    description: "Added money to Camp Cash",
    createdAt: new Date(),
  };

  await walletTransactions.insertOne(transaction);

  return c.json({
    message: `Successfully added ₹${amount}`,
    newBalance: updatedUser.campCash || 0,
  }, 200);
};
