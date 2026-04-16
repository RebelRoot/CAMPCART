import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import gigRoute from "./routes/gig.route.js";
import orderRoute from "./routes/order.route.js";
import conversationRoute from "./routes/conversation.route.js";
import messageRoute from "./routes/message.route.js";
import reviewRoute from "./routes/review.route.js";
import authRoute from "./routes/auth.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import schemeRoute from "./routes/scheme.route.js";
import walletRoute from "./routes/wallet.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import startOrderCleanupJob from "./cron/orderCleanup.js";
//const express = require("express");

const app = express();
dotenv.config();
mongoose.set("strictQuery", true);

const connect = async () => {
  try {
    if (!process.env.MONGO) {
      console.error("ERROR: MONGO environment variable is not set!");
      console.error("Please check your .env file. For FerretDB, use:");
      console.error("MONGO=mongodb://admin:adminpass@localhost:27017/gigmart?authSource=admin");
      process.exit(1);
    }

    // Connection options for FerretDB compatibility
    const options = {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    await mongoose.connect(process.env.MONGO, options);
    console.log("Connected to database!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.error("Make sure FerretDB/MongoDB is running on port 27017.");
    console.error("To start FerretDB: docker-compose -f ferretdb-docker-compose.yml up -d");
    process.exit(1);
  }
};

// Parse CORS origins (comma-separated or single)
const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:5173'];
console.log('Allowed CORS origins:', corsOrigins);

// Configured CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = corsOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed === origin) return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.replace('*.', '');
        return origin.endsWith(domain);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/gigs", gigRoute);
app.use("/api/orders", orderRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/schemes", schemeRoute);
app.use("/api/wallet", walletRoute);

// Health check endpoint for monitoring/hosting platforms
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  // Log full error details for debugging
  console.error(`[ERROR ${errorStatus}] ${req.method} ${req.path}:`, err);

  return res.status(errorStatus).send(errorMessage);
});

// Connect to DB first, then start server
const startServer = async () => {
  await connect();
  const port = process.env.PORT || 8800;
  app.listen(port, () => {
    startOrderCleanupJob(); // Start auto-cleanup of unpaid orders
    console.log(`Backend Server is running on port ${port}!`);
  });
};

startServer();
