import db from '../utils/mongodb.js';
import createError from '../utils/createError.js';

export const deleteUser = async (c) => {
  const users = db('users', c.env);
  const id = c.req.param('id');
  const role = c.get('role');
  const userId = c.get('userId');

  const user = await users.findById(id);
  if (!user) throw createError(404, "User not found!");

  const rolesHierarchy = { buyer: 1, seller: 1, giga: 2, root: 3, admin: 4 };
  const myRank = rolesHierarchy[role] || 0;
  const targetRank = rolesHierarchy[user.role] || 0;

  const isOwnAccount = userId === user._id.toString();
  const hasAuthority = myRank > targetRank;
  const isAdmin = role === "admin";
  const canGigaDelete = role === "giga" && user.isVerifiedStore;

  if (!isOwnAccount && !hasAuthority && !isAdmin && !canGigaDelete) {
    throw createError(403, "You do not have authority to delete this account!");
  }

  await users.deleteOne({ _id: { "$oid": id } });
  return c.text("Deleted successfully.", 200);
};

export const getUser = async (c) => {
  const users = db('users', c.env);
  const user = await users.findById(c.req.param('id'));
  return c.json(user, 200);
};

export const updateUser = async (c) => {
  const users = db('users', c.env);
  const id = c.req.param('id');
  const userId = c.get('userId');
  const body = await c.req.json();

  if (userId !== id) {
    throw createError(403, "You can only update your own account!");
  }

  const allowedUpdates = {};
  const fields = ['desc', 'img', 'college', 'hostel', 'phone', 'vpa', 'gender', 'state', 'affiliation'];
  fields.forEach(f => {
    if (body[f] !== undefined) allowedUpdates[f] = body[f];
  });

  await users.findByIdAndUpdate(id, { $set: allowedUpdates });
  const updatedUser = await users.findById(id);
  return c.json(updatedUser, 200);
};

export const getVerifiedStores = async (c) => {
  const users = db('users', c.env);
  const stores = await users.find({ isVerifiedStore: true });
  return c.json(stores, 200);
};

export const searchUsers = async (c) => {
  const users = db('users', c.env);
  const q = c.req.query('username');
  if (!q) throw createError(400, "Please provide a username!");

  const result = await users.find({
    username: { $regex: q, $options: "i" },
  }, { limit: 10 });
  return c.json(result, 200);
};
