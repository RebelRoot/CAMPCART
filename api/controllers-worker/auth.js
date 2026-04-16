import { sign } from 'hono/jwt';
import { setCookie, deleteCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import db from '../utils/mongodb.js';
import createError from '../utils/createError.js';

export const register = async (c) => {
  const body = await c.req.json();
  const users = db('users', c.env);
  
  const hash = await bcrypt.hash(body.password, 5);
  const role = body.isSeller ? 'seller' : 'buyer';
  
  const newUser = {
    ...body,
    password: hash,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await users.insertOne(newUser);
  return c.text("User has been created.", 201);
};

export const login = async (c) => {
  const body = await c.req.json();
  const env = c.env;
  const users = db('users', env);

  if (!env.JWT_KEY) {
    throw createError(500, "Server configuration error: JWT_KEY not set");
  }

  if (!body.username || !body.password) {
    throw createError(400, "Username and password are required!");
  }

  const user = await users.findOne({ username: body.username });
  if (!user) {
    throw createError(404, "User not found!");
  }

  const isCorrect = await bcrypt.compare(body.password, user.password);
  if (!isCorrect) {
    throw createError(400, "Wrong username or password!");
  }

  const token = await sign(
    {
      id: user._id,
      isSeller: user.isSeller,
      role: user.role,
      college: user.college,
      gender: user.gender,
      state: user.state,
      affiliation: user.affiliation,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
    },
    env.JWT_KEY
  );

  const { password, ...info } = user;
  
  setCookie(c, 'accessToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24
  });

  return c.json(info, 200);
};

export const logout = async (c) => {
  deleteCookie(c, 'accessToken', {
    path: '/',
    secure: true,
    sameSite: 'Lax'
  });
  return c.text("User has been logged out.", 200);
};
