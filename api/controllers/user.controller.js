import User from "../models/user.model.js";
import createError from "../utils/createError.js";

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError(404, "User not found!"));

    const rolesHierarchy = { buyer: 1, seller: 1, giga: 2, root: 3, admin: 4 };
    const myRank = rolesHierarchy[req.role] || 0;
    const targetRank = rolesHierarchy[user.role] || 0;

    const isOwnAccount = req.userId === user._id.toString();
    const hasAuthority = myRank > targetRank;
    const isAdmin = req.role === "admin";

    // Special rule: Giga can delete Verified Stores
    const canGigaDelete = req.role === "giga" && user.isVerifiedStore;

    if (!isOwnAccount && !hasAuthority && !isAdmin && !canGigaDelete) {
      return next(createError(403, "You do not have authority to delete this account!"));
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("Deleted successfully.");
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).send(user);
};

export const updateUser = async (req, res, next) => {
  try {
    // Only allow users to update their own profile
    if (req.userId !== req.params.id) {
      return next(createError(403, "You can only update your own account!"));
    }

    // Fields that can be updated
    const allowedUpdates = {
      desc: req.body.desc,
      img: req.body.img,
      college: req.body.college,
      hostel: req.body.hostel,
      phone: req.body.phone,
      vpa: req.body.vpa,
      gender: req.body.gender,
      state: req.body.state,
      affiliation: req.body.affiliation,
    };

    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) delete allowedUpdates[key];
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { new: true }
    );

    res.status(200).send(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const getVerifiedStores = async (req, res, next) => {
  try {
    const stores = await User.find({ isVerifiedStore: true });
    res.status(200).send(stores);
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const q = req.query.username;
    if (!q) return next(createError(400, "Please provide a username!"));

    const users = await User.find({
      username: { $regex: q, $options: "i" },
    }).limit(10);
    res.status(200).send(users);
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return next(createError(404, "User not found!"));

    const rolesHierarchy = { buyer: 1, seller: 1, giga: 2, root: 3, admin: 4 };
    const requesterAuthority = rolesHierarchy[req.role] || 0;
    const targetAuthority = rolesHierarchy[targetUser.role] || 0;
    const newRoleAuthority = rolesHierarchy[req.body.role] || 0;

    // Rule: Requester must have higher rank than target
    if (requesterAuthority <= targetAuthority && req.role !== 'admin') {
      return next(createError(403, "You do not have authority over this user!"));
    }

    // Rule: Requester cannot assign a rank higher or equal to their own (unless admin)
    if (requesterAuthority <= newRoleAuthority && req.role !== 'admin') {
      return next(createError(403, "You cannot assign a role higher or equal to your own!"));
    }

    // Exception: Giga can give/verify verifiedStore
    if (req.role === 'giga' && req.body.isVerifiedStore !== undefined) {
        targetUser.isVerifiedStore = req.body.isVerifiedStore;
    } else if (req.body.role) {
        targetUser.role = req.body.role;
    }

    if (req.body.isVerifiedStore !== undefined) {
        targetUser.isVerifiedStore = req.body.isVerifiedStore;
    }

    await targetUser.save();
    res.status(200).send("User updated successfully!");
  } catch (err) {
    next(err);
  }
};