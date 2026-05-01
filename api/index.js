import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// Controllers (Worker versions)
import * as auth from './controllers-worker/auth.js';
import * as user from './controllers-worker/user.js';
import * as gig from './controllers-worker/gig.js';
import * as order from './controllers-worker/order.js';
import * as conversation from './controllers-worker/conversation.js';
import * as message from './controllers-worker/message.js';
import * as review from './controllers-worker/review.js';
import * as wallet from './controllers-worker/wallet.js';
import * as scheme from './controllers-worker/scheme.js';
import * as analytics from './controllers-worker/analytics.js';

// Middleware
import { verifyToken, verifyAdmin, verifySeller } from './middleware/auth.js';

const app = new Hono().basePath('/api');

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());

app.use('*', async (c, next) => {
  const allowed = (c.env.CORS_ORIGIN || 'https://campcart.online')
    .split(',')
    .map(o => o.trim());

  return cors({
    origin: (origin) => allowed.includes(origin) ? origin : null,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Set-Cookie'],
  })(c, next);
});

// Force No-Cache for migration
app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
});

// Auth Routes
app.post('/auth/register', auth.register);
app.post('/auth/login', auth.login);
app.post('/auth/logout', auth.logout);

// User Routes
app.get('/users/verified', user.getVerifiedStores);
app.get('/users/search', verifyToken, user.searchUsers);
app.get('/users/:id', user.getUser);
app.put('/users/:id', verifyToken, user.updateUser);
app.delete('/users/:id', verifyToken, user.deleteUser);

// Gig Routes
app.get('/gigs', gig.getGigs);
app.get('/gigs/my', verifyToken, gig.getMyGigs);
app.get('/gigs/single/:id', gig.getGig);
app.post('/gigs', verifyToken, gig.createGig);
app.delete('/gigs/:id', verifyToken, gig.deleteGig);

// Order
app.get('/orders', verifyToken, order.getOrders);
app.get('/orders/single/:id', verifyToken, order.getOrder);
app.post('/orders/create-p2p/:id', verifyToken, order.createP2POrder);
app.put('/orders/confirm/:id', verifyToken, order.sellerConfirmOrder);

// Conversation
app.get('/conversations', verifyToken, conversation.getConversations);
app.get('/conversations/single/:id', verifyToken, conversation.getSingleConversation);
app.post('/conversations', verifyToken, conversation.createConversation);
app.put('/conversations/:id', verifyToken, conversation.updateConversation);

// Message Routes
app.get('/messages/:id', verifyToken, message.getMessages);
app.post('/messages', verifyToken, message.createMessage);

// Review Routes
app.get('/reviews/:gigId', review.getReviews);
app.post('/reviews', verifyToken, review.createReview);

// Wallet Routes
app.get('/wallet/balance', verifyToken, wallet.getBalance);
app.post('/wallet/send', verifyToken, wallet.sendMoney);
app.post('/wallet/add', verifyToken, wallet.addMoney);

// Scheme Routes
app.get('/schemes', scheme.getSchemes);
app.post('/schemes/sync', verifyToken, scheme.syncSchemes);

// Analytics Routes
app.get('/analytics/seller', verifyToken, analytics.getSellerAnalytics);
app.get('/analytics/buyer', verifyToken, analytics.getBuyerAnalytics);

// Health Check
app.get('/health', (c) => c.json({ status: 'healthy', timestamp: new Date().toISOString() }));

// Error Handling
app.onError((err, c) => {
  const status = err.status || 500;
  console.error(`[ERROR ${status}] ${c.req.method} ${c.req.path}:`, err);
  return c.text(err.message || 'Internal Server Error', status);
});

export default app;
