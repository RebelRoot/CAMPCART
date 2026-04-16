import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const register = async (req, res, next) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 5);
    
    // Set role based on isSeller flag
    const role = req.body.isSeller ? 'seller' : 'buyer';
    
    const newUser = new User({
      ...req.body,
      password: hash,
      role,
    });

    await newUser.save();
    res.status(201).send("User has been created.");
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    // Validate JWT_KEY is configured
    if (!process.env.JWT_KEY) {
      console.error("JWT_KEY environment variable is not set!");
      return next(createError(500, "Server configuration error: JWT_KEY not set"));
    }

    // Validate request body
    if (!req.body.username || !req.body.password) {
      return next(createError(400, "Username and password are required!"));
    }

    console.log(`[LOGIN ATTEMPT] Username: ${req.body.username}`);

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      console.log(`[LOGIN FAILED] User not found: ${req.body.username}`);
      return next(createError(404, "User not found!"));
    }

    console.log(`[LOGIN] User found: ${user.username}, checking password...`);

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect) {
      console.log(`[LOGIN FAILED] Wrong password for user: ${req.body.username}`);
      return next(createError(400, "Wrong username or password!"));
    }

    console.log(`[LOGIN SUCCESS] Password correct, generating token...`);

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
        role: user.role,
        college: user.college,
        gender: user.gender,
        state: user.state,
        affiliation: user.affiliation,
      },
      process.env.JWT_KEY
    );

    const { password, ...info } = user._doc;
    console.log(`[LOGIN SUCCESS] Token generated for: ${req.body.username}`);

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: false, // Set to false for local development on http
        sameSite: "lax", // Good for cross-port localhost
      })
      .status(200)
      .send(info);
  } catch (err) {
    console.error("LOGIN ERROR [API]:", err);
    console.error("Error stack:", err.stack);
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "lax",
      secure: false,
    })
    .status(200)
    .send("User has been logged out.");
};
