import React from "react";
import "./Bill.scss";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import moment from "moment";

const Bill = () => {
  const { id } = useParams();

  // Fetch order details
  const { isLoading: orderLoading, error: orderError, data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: () => newRequest.get(`/orders/single/${id}`).then((res) => res.data),
  });

  // Fetch bill data
  const { isLoading: billLoading, data: bill } = useQuery({
    queryKey: ["bill", id],
    queryFn: () => newRequest.get(`/orders/bill/${id}`).then((res) => res.data),
    enabled: !!order?.billGenerated,
  });

  // Fetch seller details
  const { data: seller } = useQuery({
    queryKey: ["user", order?.sellerId],
    queryFn: () => newRequest.get(`/users/${order.sellerId}`).then((res) => res.data),
    enabled: !!order?.sellerId,
  });

  // Fetch buyer details
  const { data: buyer } = useQuery({
    queryKey: ["user", order?.buyerId],
    queryFn: () => newRequest.get(`/users/${order.buyerId}`).then((res) => res.data),
    enabled: !!order?.buyerId,
  });

  if (orderLoading || billLoading) return <div className="bill">Loading invoice...</div>;
  if (orderError) return <div className="bill">Error loading invoice.</div>;
  if (!order) return <div className="bill">Order not found</div>;

  const isBillReady = order.billGenerated && bill;
  const billNumber = isBillReady ? bill.billNumber : `TEMP-${order._id.slice(-8).toUpperCase()}`;
  const billDate = isBillReady ? bill.generatedAt : order.completedAt || order.updatedAt;

  // Calculate pricing breakdown
  const basePrice = bill?.basePrice || (order.price - (order.lateCharge || 0));
  const lateCharge = bill?.codFee || order.lateCharge || 0;

  return (
    <div className="bill">
      <div className="invoice-card">
        <div className="actions-bar">
          <Link to={`/track/${id}`} className="back-btn">← Back to Order</Link>
          <button className="print-btn" onClick={() => window.print()}>🖨️ Print Bill</button>
        </div>

        <div className="header">
          <div className="brand">
            <div className="logo">
              <h1>Camp<span>Cart</span></h1>
              <p className="tagline">Hostel Marketplace</p>
            </div>
            <div className="contact">
              <p>support@campcart.com</p>
              <p>www.campcart.com</p>
            </div>
          </div>
          <div className="invoice-meta">
            <h2>INVOICE</h2>
            <div className="meta-row">
              <span className="label">Bill #:</span>
              <span className="value">{billNumber}</span>
            </div>
            <div className="meta-row">
              <span className="label">Order ID:</span>
              <span className="value">#{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="meta-row">
              <span className="label">Date:</span>
              <span className="value">{moment(billDate).format("MMMM DD, YYYY")}</span>
            </div>
            <div className="meta-row">
              <span className="label">Status:</span>
              <span className={`status-badge ${order.status}`}>{order.status?.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="parties-section">
          <div className="party-box seller">
            <h3>📦 Sold By</h3>
            <div className="party-details">
              <p className="name">{seller?.username || "Unknown Seller"}</p>
              {seller?.email && <p className="email">{seller.email}</p>}
              {seller?.phone && <p className="phone">📞 {seller.phone}</p>}
              <p className="id">Seller ID: {order.sellerId.slice(-6)}</p>
            </div>
          </div>

          <div className="party-box buyer">
            <h3>👤 Billed To</h3>
            <div className="party-details">
              <p className="name">{buyer?.username || buyer?.fullName || "Unknown Buyer"}</p>
              {buyer?.email && <p className="email">{buyer.email}</p>}
              {buyer?.phone && <p className="phone highlight">📞 {buyer.phone}</p>}
              <p className="id">Buyer ID: {order.buyerId.slice(-6)}</p>
            </div>
          </div>
        </div>

        <div className="items-section">
          <h3>Order Details</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div className="item-info">
                    {order.img && <img src={order.img} alt={order.title} className="item-thumb" />}
                    <span className="item-title">{order.title}</span>
                  </div>
                </td>
                <td>1</td>
                <td>₹{basePrice}</td>
                <td className="amount">₹{basePrice}</td>
              </tr>
              {lateCharge > 0 && (
                <tr>
                  <td>2</td>
                  <td>
                    <div className="item-info">
                      <span className="item-title">COD Fee / Late Charge</span>
                    </div>
                  </td>
                  <td>1</td>
                  <td>₹{lateCharge}</td>
                  <td className="amount">₹{lateCharge}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="subtotal">
                <td colSpan="4">Subtotal</td>
                <td>₹{order.price}</td>
              </tr>
              <tr className="total">
                <td colSpan="4"><strong>TOTAL PAID / PAYABLE</strong></td>
                <td><strong>₹{order.price}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="payment-section">
          <div className="payment-info">
            <h3>Payment Information</h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="label">Method:</span>
                <span className="value">{order.paymentMethod === "prepaid" ? "UPI / Online Transfer" : "Cash on Delivery (COD)"}</span>
              </div>
              {order.paymentReference && (
                <div className="info-row">
                  <span className="label">Reference:</span>
                  <span className="value mono">{order.paymentReference}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="info-row">
                  <span className="label">Completed:</span>
                  <span className="value">{moment(order.completedAt).format("MMM DD, YYYY at h:mm A")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="footer">
          <div className="thank-you">
            <h4>Thank you for shopping with CampCart! 🎉</h4>
            <p>Your trusted hostel marketplace</p>
          </div>
          <div className="disclaimer">
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>For any queries, please contact support@campcart.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bill;
