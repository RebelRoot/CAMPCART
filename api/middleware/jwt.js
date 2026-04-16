import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    console.log("No accessToken found in cookies. Available cookies:", req.cookies);
    return next(createError(401,"You are not authenticated!"))
  }


  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return next(createError(403,"Token is not valid!"))
    req.userId = payload.id;
    req.isSeller = payload.isSeller;
    req.role = payload.role;
    req.college = payload.college;
    next()
  });
};

// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.role !== 'admin') {
      return next(createError(403, "Only admins can perform this action!"));
    }
    next();
  });
};

// Middleware to verify seller role (or higher authority)
export const verifySeller = (req, res, next) => {
  verifyToken(req, res, () => {
    const isPowerRole = ['seller', 'giga', 'root', 'admin'].includes(req.role);
    if (!req.isSeller && !isPowerRole) {
      return next(createError(403, "Only sellers can perform this action!"));
    }
    next();
  });
};

// Generic authority verification
export const verifyAuthority = (roles) => (req, res, next) => {

  verifyToken(req, res, () => {
    if (!roles.includes(req.role)) {
      return next(createError(403, "You do not have the required authority!"));
    }
    next();
  });
};