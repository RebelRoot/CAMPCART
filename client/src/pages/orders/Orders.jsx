import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Orders.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Orders = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [view, setView] = React.useState("buying"); // 'buying' or 'selling'

  const { isLoading, error, data } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      newRequest.get(`/orders`).then((res) => {
        return res.data;
      }),
  });

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/orders/confirm/${id}`);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["order", id]); // Invalidate single order for track page
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/orders/verify-p2p/${id}`);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["order", id]); // Invalidate single order for track page
      toast.success("Payment verified! Order is now processing.");
    },
    onError: (err) => toast.error(err?.response?.data || "Failed to verify"),
  });

  const shipMutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/orders/ship/${id}`);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["order", id]); // Invalidate single order
      toast.success("Order marked as shipped!");
    },
    onError: (err) => toast.error(err?.response?.data || "Failed to update"),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/orders/complete/${id}`);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["order", id]); // Invalidate single order
      queryClient.invalidateQueries(["bill", id]); // Invalidate bill data
      toast.success("Order completed! Bill generated.");
    },
    onError: (err) => toast.error(err?.response?.data || "Failed to complete"),
  });

  const handleConfirm = (id) => {
    mutation.mutate(id);
  };

  const handleVerify = (id) => {
    verifyMutation.mutate(id);
  };

  const handleContact = async (order) => {
    const sellerId = order.sellerId;
    const buyerId = order.buyerId;
    const orderId = order._id;
    // Create order-specific conversation ID
    const baseId = sellerId + buyerId;
    const orderSpecificId = `${baseId}_${orderId}`;

    // Determine role for THIS order (not global isSeller)
    // If current user is the seller for this order, chat with buyer
    // If current user is the buyer for this order, chat with seller
    const isOrderSeller = currentUser._id === sellerId;
    const chatWithId = isOrderSeller ? buyerId : sellerId;

    try {
      // Try to get order-specific conversation
      const res = await newRequest.get(`/conversations/single/${orderSpecificId}`);
      navigate(`/message/${res.data.id}`);
    } catch (err) {
      if (err.response.status === 404) {
        // Create new conversation for this specific order
        const res = await newRequest.post(`/conversations/`, {
          to: chatWithId,
          orderId: orderId,
          gigId: order.gigId,
        });
        navigate(`/message/${res.data.id}`);
      }
    }
  };
  return (
    <div className="orders">
      <ToastContainer position="top-center" />
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Orders</h1>
            <div className="tabs">
              <button 
                className={view === "buying" ? "active" : ""} 
                onClick={() => setView("buying")}
              >
                My Purchases
              </button>
              {currentUser.isSeller && (
                <button 
                  className={view === "selling" ? "active" : ""} 
                  onClick={() => setView("selling")}
                >
                  My Sales
                </button>
              )}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Proof</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter(order => view === "buying" ? order.buyerId === currentUser._id : order.sellerId === currentUser._id)
                .map((order) => (
                <tr key={order._id}>
                  <td>
                    <img className="image" src={order.img} alt="" />
                  </td>
                  <td>{order.title}</td>
                  <td>₹ {order.price}</td>
                  <td>{order.paymentMethod?.toUpperCase()}</td>
                  <td>
                    <span className={`status ${order.status}`}>{order.status?.replace('_', ' ')}</span>
                  </td>
                  <td>
                    {order.paymentScreenshot && (
                      <a href={order.paymentScreenshot} target="_blank" rel="noreferrer" className="view-proof">
                         View Proof
                      </a>
                    )}
                    {order.paymentReference && <div className="utr">UTR: {order.paymentReference}</div>}
                  </td>
                  <td>
                    <div className="actions">
                      {/* Track Button - Always Visible */}
                      <Link to={`/track/${order._id}`}>
                        <button className="track-btn">Track</button>
                      </Link>

                      {/* Chat Button */}
                      <button 
                        className="chat-icon-btn"
                        onClick={() => handleContact(order)}
                        title="Chat"
                      >
                        💬
                      </button>
                      
                      {view === "selling" ? (
                        <>
                          {/* Phase 1: Confirm Payment */}
                          {order.status === "pending_confirmation" && !order.isUserConfirmed && (
                            <button className="confirm-btn" onClick={() => handleConfirm(order._id)}>
                              Accept COD
                            </button>
                          )}
                          {order.status === "pending_confirmation" && order.isUserConfirmed && (
                            <button className="verify-btn" onClick={() => handleVerify(order._id)}>
                              Verify Payment
                            </button>
                          )}
                          
                          {/* Phase 2: Mark as Shipped */}
                          {order.status === "processing" && (
                            <button 
                              className="ship-btn" 
                              onClick={() => shipMutation.mutate(order._id)}
                              disabled={shipMutation.isLoading}
                            >
                              {shipMutation.isLoading ? "..." : "📦 Mark Shipped"}
                            </button>
                          )}
                          
                          {/* Phase 3: Complete Order */}
                          {order.status === "shipped" && (
                            <button 
                              className="complete-btn" 
                              onClick={() => completeMutation.mutate(order._id)}
                              disabled={completeMutation.isLoading}
                            >
                              {completeMutation.isLoading ? "..." : "✅ Complete"}
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Buyer: Pay Now */}
                          {order.status === "pending_payment" && (
                            <Link to={`/pay/${order._id}`}>
                              <button className="pay-btn">Pay Now</button>
                            </Link>
                          )}
                          
                          {/* Buyer: Complete Order */}
                          {order.status === "shipped" && (
                            <button 
                              className="complete-btn" 
                              onClick={() => completeMutation.mutate(order._id)}
                              disabled={completeMutation.isLoading}
                            >
                              {completeMutation.isLoading ? "..." : "✅ I Received It"}
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* View Bill for Completed Orders */}
                      {order.status === "completed" && order.billGenerated && (
                        <Link to={`/bill/${order._id}`}>
                          <button className="bill-btn">🧾 Bill</button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;