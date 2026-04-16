import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Track.scss";
import moment from "moment";

const Track = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Fetch order details
  const { isLoading, error, data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: () => newRequest.get(`/orders/single/${id}`).then((res) => res.data),
  });

  // Fetch seller details
  const { data: seller } = useQuery({
    queryKey: ["user", order?.sellerId],
    queryFn: () => newRequest.get(`/users/${order.sellerId}`).then((res) => res.data),
    enabled: !!order?.sellerId,
  });

  // Mutations for order actions
  const shipMutation = useMutation({
    mutationFn: () => newRequest.put(`/orders/ship/${id}`),
    onSuccess: () => {
      toast.success("Order marked as shipped!");
      queryClient.invalidateQueries(["order", id]);
    },
    onError: (err) => toast.error(err?.response?.data || "Failed to update order"),
  });

  const completeMutation = useMutation({
    mutationFn: () => newRequest.put(`/orders/complete/${id}`),
    onSuccess: () => {
      toast.success("Order completed! Bill generated.");
      queryClient.invalidateQueries(["order", id]);
      queryClient.invalidateQueries(["bill", id]);
    },
    onError: (err) => toast.error(err?.response?.data || "Failed to complete order"),
  });

  if (isLoading) return <div className="track">Loading order details...</div>;
  if (error) return <div className="track">Error loading order: {error.message}</div>;
  if (!order) return <div className="track">Order not found</div>;

  // Determine user's role for this order
  const isOrderSeller = currentUser._id === order.sellerId;
  const isOrderBuyer = currentUser._id === order.buyerId;

  // Define timeline phases
  const getTimeline = () => {
    const phases = [
      { 
        key: "ordered", 
        label: "Order Placed", 
        date: order.createdAt,
        description: "Your order has been placed successfully",
        icon: "🛒"
      },
      { 
        key: "payment", 
        label: "Payment Confirmed", 
        date: order.paymentScreenshot || order.paymentReference ? order.updatedAt : null,
        description: order.paymentMethod === "cod" ? "Cash on Delivery selected" : "Payment verified by seller",
        icon: "💳"
      },
      { 
        key: "processing", 
        label: "Processing", 
        date: order.status === "processing" || order.status === "shipped" || order.status === "completed" ? order.updatedAt : null,
        description: "Order is being prepared",
        icon: "📦"
      },
      { 
        key: "shipped", 
        label: "Shipped", 
        date: order.shippedAt,
        description: "Order is on the way",
        icon: "🚚"
      },
      { 
        key: "completed", 
        label: "Completed", 
        date: order.completedAt,
        description: "Order delivered and completed",
        icon: "✅"
      },
    ];
    return phases;
  };

  const timeline = getTimeline();

  // Get current active phase
  const getActivePhase = () => {
    if (order.status === "completed") return 4;
    if (order.status === "shipped") return 3;
    if (order.status === "processing") return 2;
    if (order.status === "pending_confirmation") return 1;
    return 0;
  };

  const activePhase = getActivePhase();

  // Bill is now handled by unified Bill page at /bill/:id

  return (
    <div className="track">
      <ToastContainer position="top-center" />
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="breadcrumbs">
            <Link to="/orders">Orders</Link> &gt; 
            <span>Track Order #{order._id.slice(-6)}</span>
          </div>
          <h1>Track Your Order</h1>
          <p className="subtitle">
            {isOrderSeller ? "Managing order as Seller" : "Tracking your order as Buyer"}
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="order-card">
          <div className="order-info">
            <img src={order.img} alt={order.title} className="order-image" />
            <div className="order-details">
              <h3>{order.title}</h3>
              <p className="price">₹ {order.price}</p>
              <p className="seller">
                {isOrderSeller ? "Buyer" : "Seller"}: {seller?.username || "Loading..."}
              </p>
            </div>
          </div>
          <div className="order-status">
            <span className={`status-badge ${order.status}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
            {order.billGenerated && (
              <Link to={`/bill/${order._id}`}>
                <button className="bill-btn">
                  🧾 View Bill
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline">
          <h2>Order Timeline</h2>
          <div className="timeline-track">
            {timeline.map((phase, index) => {
              const isCompleted = index <= activePhase;
              const isActive = index === activePhase;
              const isPending = index > activePhase;
              
              return (
                <div 
                  key={phase.key} 
                  className={`timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
                >
                  <div className="timeline-icon">{phase.icon}</div>
                  <div className="timeline-content">
                    <h4>{phase.label}</h4>
                    {phase.date && (
                      <p className="date">{moment(phase.date).format("MMM DD, h:mm a")}</p>
                    )}
                    <p className="description">{phase.description}</p>
                  </div>
                  {index < timeline.length - 1 && (
                    <div className={`timeline-line ${index < activePhase ? 'completed' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Proof Section (if prepaid) */}
        {(order.paymentScreenshot || order.paymentReference) && (
          <div className="proof-section">
            <h2>Payment Proof</h2>
            <div className="proof-content">
              {order.paymentScreenshot && (
                <div className="proof-image-container">
                  <img 
                    src={order.paymentScreenshot} 
                    alt="Payment Proof" 
                    className="proof-image"
                    onClick={() => window.open(order.paymentScreenshot, '_blank')}
                  />
                  <p className="hint">Click to enlarge</p>
                </div>
              )}
              {order.paymentReference && (
                <div className="utr-box">
                  <label>UTR / Reference Number</label>
                  <p>{order.paymentReference}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-section">
          <h2>Actions</h2>
          <div className="action-buttons">
            {isOrderSeller && order.status === "processing" && (
              <button 
                className="action-btn ship"
                onClick={() => shipMutation.mutate()}
                disabled={shipMutation.isLoading}
              >
                {shipMutation.isLoading ? "Updating..." : "📦 Mark as Shipped"}
              </button>
            )}
            
            {order.status === "shipped" && (
              <button 
                className="action-btn complete"
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isLoading}
              >
                {completeMutation.isLoading ? "Processing..." : "✅ Mark as Completed"}
              </button>
            )}
            
            {order.status === "processing" && isOrderBuyer && (
              <p className="info-text">Seller is preparing your order for shipment...</p>
            )}
            
            {order.status === "completed" && (
              <div className="completion-message">
                <span className="success-icon">🎉</span>
                <p>Order completed successfully!</p>
                {order.billGenerated && (
                  <Link to={`/bill/${order._id}`}>
                    <button className="bill-btn large">
                      🧾 View & Print Bill
                    </button>
                  </Link>
                )}
              </div>
            )}

            <Link to={`/message/${order.sellerId}${order.buyerId}_${order._id}`}>
              <button className="action-btn chat">
                💬 Chat with {isOrderSeller ? "Buyer" : "Seller"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;
