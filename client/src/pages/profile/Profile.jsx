import React, { useState, useEffect } from "react";
import "./Profile.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useNavigate, Link } from "react-router-dom";
import { Wallet, Send, Download, History, Plus, Loader2 } from "lucide-react";
import newRequest from "../../utils/newRequest";
import { toast, ToastContainer } from "react-toastify";

function Profile() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(currentUser?.campCash || 0);
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await newRequest.get("/wallet/balance");
      setBalance(res.data.balance);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const handleAddMoney = async () => {
    try {
      setLoading(true);
      const res = await newRequest.post("/wallet/add", { amount: 100 });
      setBalance(res.data.newBalance);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data || "Failed to add money");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async (e) => {
    setSearchUser(e.target.value);
    if (e.target.value.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await newRequest.get(`/wallet/search?username=${e.target.value}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleSendMoney = async (receiverUsername) => {
    if (!sendAmount || sendAmount <= 0) {
      toast.error("Enter valid amount");
      return;
    }
    try {
      setLoading(true);
      const res = await newRequest.post("/wallet/send", {
        receiverUsername,
        amount: parseInt(sendAmount),
      });
      setBalance(res.data.newBalance);
      toast.success(res.data.message);
      setShowSendModal(false);
      setSendAmount("");
      setSearchUser("");
      setSearchResults([]);
    } catch (err) {
      toast.error(err.response?.data || "Failed to send money");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await newRequest.get("/wallet/history");
      setTransactions(res.data.transactions);
      setShowHistoryModal(true);
    } catch (err) {
      toast.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  return (
    <div className="profile">
      <ToastContainer position="top-center" />
      <div className="container">
        <div className="header-section">
          <div className="user-info">
            <div className="avatar-container">
              <img 
                src={currentUser.img || "/img/user.jpg"} 
                alt={currentUser.username} 
              />
              {currentUser.isVerifiedStore && <span className="verified-badge">✓</span>}
            </div>
            <div className="text-info">
              <h1>{currentUser.username}</h1>
              <span className="role-tag">{currentUser.role}</span>
              <p className="college">{currentUser.college}</p>
            </div>
          </div>
          <button className="edit-btn" onClick={() => navigate("/edit-profile")}>
            Edit Profile
          </button>
        </div>

        <div className="main-content">
          <div className="left">
            {/* Camp Cash Advertisement Banner */}
            <div className="campcash-ad">
              <img src="/img/campcash-logo.png" alt="Camp Cash - Campus Digital Currency" className="ad-logo" />
              <div className="ad-text">
                <h3>Camp Cash</h3>
                <p>Campus Digital Currency</p>
              </div>
            </div>

            {/* Camp Cash Wallet */}
            <div className="wallet-banner">
              <div className="wallet-content">
                <div className="wallet-main">
                  <div className="wallet-brand">
                    <span className="brand-text">Camp Cash</span>
                  </div>
                  <div className="wallet-balance-section">
                    <span className="balance-label">Available Balance</span>
                    <span className="balance-amount">₹{balance}</span>
                  </div>
                  <button 
                    className="add-money-btn" 
                    onClick={handleAddMoney}
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                    Add Money
                  </button>
                </div>
                <div className="wallet-actions-bar">
                  <button 
                    className="action-btn"
                    onClick={() => setShowSendModal(true)}
                  >
                    <div className="action-icon send">
                      <Send size={20} />
                    </div>
                    <span>Send</span>
                  </button>
                  <button className="action-btn receive-btn">
                    <div className="action-icon receive">
                      <Download size={20} />
                    </div>
                    <span>Receive</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={fetchHistory}
                  >
                    <div className="action-icon history">
                      <History size={20} />
                    </div>
                    <span>History</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Send Money Modal */}
            {showSendModal && (
              <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Send Camp Cash</h3>
                  <input
                    type="text"
                    placeholder="Search username..."
                    value={searchUser}
                    onChange={handleSearchUser}
                  />
                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map((user) => (
                        <div key={user._id} className="user-item">
                          <span>{user.username}</span>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            min="1"
                          />
                          <button 
                            onClick={() => handleSendMoney(user.username)}
                            disabled={loading}
                          >
                            {loading ? "Sending..." : "Send"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="close-btn" onClick={() => setShowSendModal(false)}>Close</button>
                </div>
              </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
              <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
                <div className="modal history-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Transaction History</h3>
                  {transactions.length === 0 ? (
                    <p>No transactions yet</p>
                  ) : (
                    <div className="transaction-list">
                      {transactions.map((tx) => (
                        <div key={tx._id} className={`transaction-item ${tx.type}`}>
                          <div className="tx-info">
                            <span className="tx-type">{tx.type}</span>
                            <span className="tx-user">
                              {tx.isSender ? "To: " : "From: "} {tx.otherUser.username}
                            </span>
                            <span className="tx-date">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`tx-amount ${tx.isSender ? 'negative' : 'positive'}`}>
                            {tx.isSender ? '-' : '+'}₹{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="close-btn" onClick={() => setShowHistoryModal(false)}>Close</button>
                </div>
              </div>
            )}

            <div className="card details">
              <h2>Contact Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Email</label>
                  <span>{currentUser.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <span>{currentUser.phone || "Not provided"}</span>
                </div>
                <div className="info-item">
                  <label>Hostel/Location</label>
                  <span>{currentUser.hostel || "Not provided"}</span>
                </div>
                <div className="info-item">
                  <label>State</label>
                  <span>{currentUser.state || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="right">
            <div className="card bio">
              <h2>About Me</h2>
              <p>{currentUser.desc || "No description provided yet. Tell others about yourself!"}</p>
            </div>

            <div className="quick-actions">
              <h2>Quick Links</h2>
              <div className="actions-grid">
                {currentUser.isSeller && (
                  <Link to="/mygigs" className="action-card">
                    <img src="/img/recycle.png" alt="gigs" />
                    <span>My Listings</span>
                  </Link>
                )}
                <Link to="/orders" className="action-card">
                  <img src="/img/greencheck.png" alt="orders" />
                  <span>My Orders</span>
                </Link>
                <Link to="/messages" className="action-card">
                  <img src="/img/message.png" alt="messages" />
                  <span>Messages</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
