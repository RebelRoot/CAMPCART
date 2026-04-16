import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Gig from "../models/gig.model.js";
import createError from "../utils/createError.js";

// Get seller dashboard analytics
export const getSellerAnalytics = async (req, res, next) => {
  try {
    const sellerId = req.userId;

    // Get all orders where this user is the seller
    const orders = await Order.find({ sellerId: sellerId.toString() });

    // Calculate metrics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.price, 0);
    
    // Orders by status
    const ordersByStatus = {
      pending_payment: orders.filter(o => o.status === "pending_payment").length,
      pending_confirmation: orders.filter(o => o.status === "pending_confirmation").length,
      processing: orders.filter(o => o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      completed: completedOrders.length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    };

    // Recent orders (last 10) with buyer info
    const recentOrders = await Order.find({ sellerId: sellerId.toString() })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get unique buyer IDs from recent orders
    const buyerIds = [...new Set(recentOrders.map(o => o.buyerId))];
    const buyers = await User.find(
      { _id: { $in: buyerIds } },
      { username: 1, email: 1, phone: 1, img: 1 }
    ).lean();

    const buyerMap = buyers.reduce((map, buyer) => {
      map[buyer._id.toString()] = buyer;
      return map;
    }, {});

    // Enrich recent orders with buyer info
    const enrichedOrders = recentOrders.map(order => ({
      ...order,
      buyer: buyerMap[order.buyerId] || null,
    }));

    // Sales by day (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const salesByDay = last7Days.map(date => {
      const dayOrders = completedOrders.filter(o => {
        const orderDate = o.completedAt || o.updatedAt;
        return orderDate && orderDate.toISOString().split('T')[0] === date;
      });
      return {
        date,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.price, 0),
      };
    });

    // Monthly stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthOrders = completedOrders.filter(o => {
      const orderDate = o.completedAt || o.updatedAt;
      return orderDate && 
        orderDate.getMonth() === currentMonth && 
        orderDate.getFullYear() === currentYear;
    });

    const monthlyStats = {
      orders: thisMonthOrders.length,
      revenue: thisMonthOrders.reduce((sum, o) => sum + o.price, 0),
    };

    // Get total active listings
    const activeListings = await Gig.countDocuments({ userId: sellerId.toString() });

    res.status(200).send({
      summary: {
        totalOrders,
        totalRevenue,
        completedOrders: completedOrders.length,
        activeListings,
        conversionRate: totalOrders > 0 ? ((completedOrders.length / totalOrders) * 100).toFixed(1) : 0,
      },
      ordersByStatus,
      recentOrders: enrichedOrders,
      salesByDay,
      monthlyStats,
    });
  } catch (err) {
    next(err);
  }
};

// Get buyer dashboard analytics
export const getBuyerAnalytics = async (req, res, next) => {
  try {
    const buyerId = req.userId;

    // Get all orders where this user is the buyer
    const orders = await Order.find({ buyerId: buyerId.toString() });

    // Calculate metrics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === "completed");
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.price, 0);

    // Orders by status
    const ordersByStatus = {
      pending_payment: orders.filter(o => o.status === "pending_payment").length,
      pending_confirmation: orders.filter(o => o.status === "pending_confirmation").length,
      processing: orders.filter(o => o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      completed: completedOrders.length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    };

    // Recent orders with seller info
    const recentOrders = await Order.find({ buyerId: buyerId.toString() })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get unique seller IDs
    const sellerIds = [...new Set(recentOrders.map(o => o.sellerId))];
    const sellers = await User.find(
      { _id: { $in: sellerIds } },
      { username: 1, email: 1, phone: 1, img: 1 }
    ).lean();

    const sellerMap = sellers.reduce((map, seller) => {
      map[seller._id.toString()] = seller;
      return map;
    }, {});

    const enrichedOrders = recentOrders.map(order => ({
      ...order,
      seller: sellerMap[order.sellerId] || null,
    }));

    res.status(200).send({
      summary: {
        totalOrders,
        totalSpent,
        completedOrders: completedOrders.length,
        pendingOrders: totalOrders - completedOrders.length,
      },
      ordersByStatus,
      recentOrders: enrichedOrders,
    });
  } catch (err) {
    next(err);
  }
};
