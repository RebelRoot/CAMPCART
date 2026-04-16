import React, { useEffect, useState } from "react";
import "./Pay.scss";
import { useParams, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { QRCodeSVG } from "qrcode.react";
import upload from "../../utils/upload";
import { useQuery } from "@tanstack/react-query";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Pay = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Order info first
  const { isLoading: isLoadingOrder, data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => newRequest.get(`/orders`).then((res) => {
        // Since we don't have a single order get, we find it in the list or I should have added a single get.
        // For efficiency, I'll filter the orders list or assume we need a new endpoint.
        // Actually, the current API doesn't have a specific getOrderById. I'll use the orders list as a workaround
        // or quickly add the endpoint. Let's assume we use the list and find.
        return res.data.find(o => o._id === orderId);
    }),
  });

  // 2. Fetch Gig info
  const { isLoading: isLoadingGig, data: gig } = useQuery({
    queryKey: ["gig", order?.gigId],
    queryFn: () => newRequest.get(`/gigs/single/${order.gigId}`).then((res) => res.data),
    enabled: !!order?.gigId,
  });

  // 3. Fetch Seller info
  const { isLoading: isLoadingSeller, data: seller } = useQuery({
    queryKey: ["user", order?.sellerId],
    queryFn: () => newRequest.get(`/users/${order.sellerId}`).then((res) => res.data),
    enabled: !!order?.sellerId,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !utr) {
      setError("Please provide both screenshot and UTR number.");
      return;
    }
    setLoading(true);
    try {
      const url = await upload(file);
      
      // 1. Submit proof to order
      await newRequest.put(`/orders/submit-p2p-proof/${orderId}`, {
        paymentReference: utr,
        paymentScreenshot: url,
      });

      // 2. Create or get conversation with seller FOR THIS SPECIFIC ORDER
      // Use order-specific conversation ID to prevent mixing with other orders
      const baseConversationId = order.sellerId + order.buyerId;
      const orderSpecificConversationId = `${baseConversationId}_${orderId}`;
      let conversation;
      
      try {
        // Try to get order-specific conversation
        const existingConv = await newRequest.get(`/conversations/single/${orderSpecificConversationId}`);
        conversation = existingConv.data;
      } catch (err) {
        // Create new conversation for this order if not exists
        if (err.response?.status === 404) {
          const newConv = await newRequest.post(`/conversations/`, {
            to: order.sellerId,
            orderId: orderId,
            gigId: order.gigId,
          });
          conversation = newConv.data;
        }
      }

      // 3. Submit proof to the correct conversation
      if (conversation) {
        await newRequest.post(`/conversations/${conversation.id}/proof`, {
          screenshot: url,
          utr: utr,
        });
      }

      toast.success("Payment proof submitted! Opening chat with seller...");
      
      // 4. Redirect to chat page after short delay
      setTimeout(() => {
        navigate(`/message/${conversation.id}`);
      }, 1500);
      
    } catch (err) {
      console.log(err);
      setError("Failed to submit proof. Please try again.");
      toast.error("Failed to submit proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingOrder || isLoadingGig || isLoadingSeller) return <div className="pay">Loading payment details...</div>;

  if (!order) return <div className="pay">Order not found.</div>;

  if (!seller?.vpa) {
    return (
      <div className="pay">
        <div className="container" style={{ textAlign: "center" }}>
          <h1>Payment Setup Required</h1>
          <p>This seller has not configured their UPI ID yet.</p>
          <p>Please contact them using the chat button in the order list to complete the payment.</p>
          <button onClick={() => navigate("/orders")}>Back to Orders</button>
        </div>
      </div>
    );
  }

  const upiLink = `upi://pay?pa=${seller?.vpa}&pn=${encodeURIComponent(seller?.username)}&am=${order?.price}&cu=INR&tn=${encodeURIComponent("Payment for " + order?.title)}`;

  return (
    <div className="pay">
      <ToastContainer position="top-center" />
      <div className="container">
        <h1>Zero-Fee P2P Payment</h1>
        <p className="subtitle">Scan the QR code below using any UPI app (GPay, PhonePe, Paytm)</p>
        
        <div className="qr-section">
          <div className="qr-container">
            <QRCodeSVG value={upiLink} size={256} includeMargin={true} />
          </div>
          <div className="payment-details">
            <div className="detail-item">
              <span>Payable Amount:</span>
              <strong>₹ {order.price}</strong>
            </div>
            <div className="detail-item">
              <span>Seller UPI ID:</span>
              <strong>{seller.vpa}</strong>
            </div>
            
            <a href={upiLink} className="upi-intent-btn">
              <img src="/img/clock.png" alt="" style={{width: '20px', filter: 'brightness(0) invert(1)'}} />
              Pay via any UPI App
            </a>
            <p className="mobile-tip">💡 Fast & secure on mobile devices</p>
          </div>
        </div>

        <hr />

        <form onSubmit={handleSubmit} className="proof-form">
          <h3>Submit Payment Proof</h3>
          <p>After paying, please upload the success screenshot and enter the 12-digit UTR/Reference number.</p>
          
          <label>UTR / Reference Number</label>
          <input 
            type="text" 
            placeholder="Enter 12-digit UTR number" 
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            required
          />

          <label>Payment Screenshot</label>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])}
            required
          />

          {error && <span className="error">{error}</span>}
          
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Confirm & Notify Seller"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Pay;