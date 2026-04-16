import db, { ObjectId } from '../utils/mongodb.js';
import createError from '../utils/createError.js';

export const getSellerAnalytics = async (c) => {
  const sellerId = c.get('userId');
  const env = c.env;
  const orders = db('orders', env);
  const users = db('users', env);
  const gigs = db('gigs', env);

  const allOrders = await orders.find({ sellerId: sellerId.toString() });

  const totalOrders = allOrders.length;
  const completedOrders = allOrders.filter(o => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.price, 0);
  
  const ordersByStatus = {
    pending_payment: allOrders.filter(o => o.status === "pending_payment").length,
    pending_confirmation: allOrders.filter(o => o.status === "pending_confirmation").length,
    processing: allOrders.filter(o => o.status === "processing").length,
    shipped: allOrders.filter(o => o.status === "shipped").length,
    completed: completedOrders.length,
    cancelled: allOrders.filter(o => o.status === "cancelled").length,
  };

  const recentOrders = await orders.find({ sellerId: sellerId.toString() }, {
    sort: { createdAt: -1 },
    limit: 10
  });

  const buyerIds = [...new Set(recentOrders.map(o => o.buyerId))];
  const buyers = await users.find({ _id: { $in: buyerIds.map(id => new ObjectId(id)) } });

  const buyerMap = buyers.reduce((map, buyer) => {
    map[buyer._id.toString()] = buyer;
    return map;
  }, {});

  const enrichedOrders = recentOrders.map(order => ({
    ...order,
    buyer: buyerMap[order.buyerId] || null,
  }));

  const activeListings = await gigs.countDocuments({ userId: sellerId.toString() });

  return c.json({
    summary: {
      totalOrders,
      totalRevenue,
      completedOrders: completedOrders.length,
      activeListings,
      conversionRate: totalOrders > 0 ? ((completedOrders.length / totalOrders) * 100).toFixed(1) : 0,
    },
    ordersByStatus,
    recentOrders: enrichedOrders,
  }, 200);
};

export const getBuyerAnalytics = async (c) => {
  const buyerId = c.get('userId');
  const env = c.env;
  const orders = db('orders', env);
  const users = db('users', env);

  const allOrders = await orders.find({ buyerId: buyerId.toString() });

  const totalOrders = allOrders.length;
  const completedOrders = allOrders.filter(o => o.status === "completed");
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.price, 0);

  const ordersByStatus = {
    pending_payment: allOrders.filter(o => o.status === "pending_payment").length,
    pending_confirmation: allOrders.filter(o => o.status === "pending_confirmation").length,
    processing: allOrders.filter(o => o.status === "processing").length,
    shipped: allOrders.filter(o => o.status === "shipped").length,
    completed: completedOrders.length,
    cancelled: allOrders.filter(o => o.status === "cancelled").length,
  };

  const recentOrders = await orders.find({ buyerId: buyerId.toString() }, {
    sort: { createdAt: -1 },
    limit: 10
  });

  const sellerIds = [...new Set(recentOrders.map(o => o.sellerId))];
  const sellers = await users.find({ _id: { $in: sellerIds.map(id => new ObjectId(id)) } });

  const sellerMap = sellers.reduce((map, seller) => {
    map[seller._id.toString()] = seller;
    return map;
  }, {});

  const enrichedOrders = recentOrders.map(order => ({
    ...order,
    seller: sellerMap[order.sellerId] || null,
  }));

  return c.json({
    summary: {
      totalOrders,
      totalSpent,
      completedOrders: completedOrders.length,
      pendingOrders: totalOrders - completedOrders.length,
    },
    ordersByStatus,
    recentOrders: enrichedOrders,
  }, 200);
};
