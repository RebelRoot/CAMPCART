import React, { useState } from "react";
import "./Dashboard.scss";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { Navigate, Link } from "react-router-dom";
import moment from "moment";

const Dashboard = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is verified store
  if (!currentUser?.isVerifiedStore) {
    return <Navigate to="/" replace />;
  }

  // Fetch real analytics data
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["sellerAnalytics"],
    queryFn: () => newRequest.get("/analytics/seller").then(res => res.data),
  });

  const formatCurrency = (amount) => {
    return "₹ " + amount?.toLocaleString("en-IN") || "₹ 0";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: "#f59e0b",
      pending_confirmation: "#3b82f6",
      processing: "#10b981",
      shipped: "#8b5cf6",
      completed: "#1dbf73",
      cancelled: "#ef4444",
    };
    return colors[status] || "#64748b";
  };

  const stats = analytics?.summary ? [
    { label: "Total Revenue", value: formatCurrency(analytics.summary.totalRevenue), icon: "💰" },
    { label: "Total Orders", value: analytics.summary.totalOrders, icon: "📦" },
    { label: "Completed", value: analytics.summary.completedOrders, icon: "✅" },
    { label: "Active Listings", value: analytics.summary.activeListings, icon: "🏪" },
  ] : [];

  const renderOverview = () => (
    <>
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <div className="label">{stat.label}</div>
              <div className="value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card orders">
          <div className="card-header">
            <h2>📦 Recent Orders</h2>
            <Link to="/orders" className="view-all">View All →</Link>
          </div>
          <div className="orders-list">
            {analytics?.recentOrders?.slice(0, 5).map((order) => (
              <div key={order._id} className="order-item">
                <div className="order-info">
                  <img src={order.img} alt={order.title} className="order-thumb" />
                  <div className="order-details">
                    <p className="order-title">{order.title}</p>
                    <p className="order-buyer">
                      👤 {order.buyer?.username || "Unknown"}
                      {order.buyer?.phone && <span className="phone">📞 {order.buyer.phone}</span>}
                    </p>
                  </div>
                </div>
                <div className="order-meta">
                  <span className="order-price">₹ {order.price}</span>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) + "20", color: getStatusColor(order.status) }}
                  >
                    {order.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {!analytics?.recentOrders?.length && (
              <p className="empty">No orders yet. Start selling!</p>
            )}
          </div>
        </div>

        <div className="dashboard-card status-chart">
          <div className="card-header">
            <h2>📊 Orders by Status</h2>
          </div>
          <div className="status-bars">
            {analytics?.ordersByStatus && Object.entries(analytics.ordersByStatus).map(([status, count]) => (
              count > 0 && (
                <div key={status} className="status-row">
                  <span className="status-label">{status.replace('_', ' ')}</span>
                  <div className="status-bar-container">
                    <div 
                      className="status-bar" 
                      style={{ 
                        width: `${analytics.summary.totalOrders ? (count / analytics.summary.totalOrders) * 100 : 0}%`,
                        backgroundColor: getStatusColor(status)
                      }}
                    />
                  </div>
                  <span className="status-count">{count}</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderMySales = () => (
    <div className="my-sales">
      <div className="dashboard-card full-width">
        <div className="card-header">
          <h2>🛒 My Sales</h2>
          <div className="filters">
            <span>All your orders as a seller</span>
          </div>
        </div>
        <table className="sales-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Product</th>
              <th>Price</th>
              <th>Status</th>
              <th>Proof</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {analytics?.recentOrders?.map((order) => (
              <tr key={order._id}>
                <td>#{order._id.slice(-6)}</td>
                <td>
                  <div className="customer-cell">
                    {order.buyer?.img && <img src={order.buyer.img} alt="" className="avatar" />}
                    <span>{order.buyer?.username || "Unknown"}</span>
                  </div>
                </td>
                <td>
                  {order.buyer?.phone ? (
                    <span className="phone">📞 {order.buyer.phone}</span>
                  ) : (
                    <span className="no-phone">No phone</span>
                  )}
                </td>
                <td>{order.title}</td>
                <td>₹ {order.price}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) + "20", color: getStatusColor(order.status) }}
                  >
                    {order.status?.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  {order.paymentScreenshot ? (
                    <a 
                      href={order.paymentScreenshot} 
                      target="_blank" 
                      rel="noreferrer"
                      className="view-proof-btn"
                    >
                      👁️ View
                    </a>
                  ) : (
                    <span className="no-proof">-</span>
                  )}
                </td>
                <td>
                  <Link to={`/track/${order._id}`}>
                    <button className="track-btn-small">Track</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!analytics?.recentOrders?.length && (
          <p className="empty">No sales yet. Keep listing products!</p>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics">
      <div className="dashboard-card">
        <div className="card-header">
          <h2>📈 Last 7 Days Sales</h2>
        </div>
        <div className="sales-chart">
          {analytics?.salesByDay?.map((day, i) => (
            <div key={i} className="day-bar">
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${Math.max(day.revenue / 100, 5)}%`,
                    minHeight: day.revenue > 0 ? '20px' : '5px'
                  }}
                >
                  {day.revenue > 0 && <span className="bar-value">₹{day.revenue}</span>}
                </div>
              </div>
              <span className="day-label">{moment(day.date).format("ddd")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2>💵 This Month</h2>
        </div>
        <div className="monthly-stats">
          <div className="big-stat">
            <span className="big-value">{formatCurrency(analytics?.monthlyStats?.revenue)}</span>
            <span className="big-label">Revenue</span>
          </div>
          <div className="big-stat">
            <span className="big-value">{analytics?.monthlyStats?.orders || 0}</span>
            <span className="big-label">Orders</span>
          </div>
          <div className="big-stat">
            <span className="big-value">{analytics?.summary?.conversionRate || 0}%</span>
            <span className="big-label">Conversion</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <div className="dashboard">Loading dashboard...</div>;
  if (error) return <div className="dashboard">Error loading dashboard</div>;

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="store-info">
          <h3>{currentUser.storeName || currentUser.username}</h3>
          <p className="verified">✓ Verified Store</p>
        </div>
        <div className="sidebar-section">
          <ul>
            <li 
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              📊 Overview
            </li>
            <li 
              className={activeTab === "sales" ? "active" : ""}
              onClick={() => setActiveTab("sales")}
            >
              🛒 My Sales
            </li>
            <li 
              className={activeTab === "analytics" ? "active" : ""}
              onClick={() => setActiveTab("analytics")}
            >
              📈 Analytics
            </li>
          </ul>
        </div>
        <div className="sidebar-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/myGigs">Manage Listings</Link></li>
            <li><Link to="/add">Add New Product</Link></li>
            <li><Link to="/orders">All Orders</Link></li>
          </ul>
        </div>
      </div>

      <div className="main-content">
        <div className="welcome">
          <h1>Welcome Back, {currentUser.storeName || currentUser.username}!</h1>
          <p>Here's what's happening in your store today.</p>
        </div>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "sales" && renderMySales()}
        {activeTab === "analytics" && renderAnalytics()}
      </div>
    </div>
  );
};

export default Dashboard;
