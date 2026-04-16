import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import createError from '../utils/createError.js';

export const verifyToken = async (c, next) => {
  const token = getCookie(c, 'accessToken');
  if (!token) {
    throw createError(401, 'You are not authenticated!');
  }

  try {
    const payload = await verify(token, c.env.JWT_KEY);
    c.set('userId', payload.id);
    c.set('isSeller', payload.isSeller);
    c.set('role', payload.role);
    c.set('college', payload.college);
    await next();
  } catch (err) {
    throw createError(403, 'Token is not valid!');
  }
};

export const verifyAdmin = async (c, next) => {
  await verifyToken(c, async () => {
    if (c.get('role') !== 'admin') {
      throw createError(403, 'Only admins can perform this action!');
    }
    await next();
  });
};

export const verifySeller = async (c, next) => {
  await verifyToken(c, async () => {
    const role = c.get('role');
    const isPowerRole = ['seller', 'giga', 'root', 'admin'].includes(role);
    if (!c.get('isSeller') && !isPowerRole) {
      throw createError(403, 'Only sellers can perform this action!');
    }
    await next();
  });
};

export const verifyAuthority = (roles) => async (c, next) => {
  await verifyToken(c, async () => {
    if (!roles.includes(c.get('role'))) {
      throw createError(403, 'You do not have the required authority!');
    }
    await next();
  });
};
