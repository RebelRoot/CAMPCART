import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import upload from "../../utils/upload";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Message.scss";

const Message = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();

  const [timeLeft, setTimeLeft] = useState(0);
  const [proofFile, setProofFile] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [uploading, setUploading] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [durationInput, setDurationInput] = useState(60);

  // Fetch messages
  const { isLoading, error, data: messages } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => newRequest.get(`/messages/${id}`).then((res) => res.data),
    refetchInterval: 3000,
  });

  // Fetch conversation details
  const { data: conversation, refetch: refetchConversation } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => newRequest.get(`/conversations/single/${id}`).then((res) => res.data),
    refetchInterval: 3000,
  });

  // Countdown timer
  useEffect(() => {
    if (!conversation?.chatAccess?.chatCloseAt) return;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const closeAt = new Date(conversation.chatAccess.chatCloseAt).getTime();
      const remaining = Math.max(0, closeAt - now);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [conversation]);

  // Format time remaining
  const formatTime = (ms) => {
    if (ms <= 0) return "00:00:00";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Submit proof mutation
  const submitProofMutation = useMutation({
    mutationFn: (proofData) => newRequest.post(`/conversations/${id}/proof`, proofData),
    onSuccess: () => {
      toast.success("Payment proof submitted! Waiting for seller verification.");
      refetchConversation();
      setProofFile(null);
      setUtrNumber("");
    },
    onError: (err) => toast.error(err?.response?.data || "Failed to submit proof"),
  });

  // Verify proof mutation (seller only)
  const verifyProofMutation = useMutation({
    mutationFn: ({ status, durationMinutes }) => 
      newRequest.put(`/conversations/${id}/verify`, { status, durationMinutes }),
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'verified' ? "Payment verified! Chat is now open." : "Payment rejected.");
      refetchConversation();
    },
    onError: (err) => toast.error(err?.response?.data || "Failed to verify"),
  });

  // Toggle chat access (seller only)
  const toggleChatMutation = useMutation({
    mutationFn: ({ enable, durationMinutes }) => 
      newRequest.put(`/conversations/${id}/chat-access`, { enable, durationMinutes }),
    onSuccess: (_, variables) => {
      toast.success(variables.enable ? `Chat enabled for ${variables.durationMinutes} minutes!` : "Chat disabled.");
      refetchConversation();
    },
    onError: (err) => toast.error(err?.response?.data || "Failed to toggle chat"),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message) => newRequest.post(`/messages`, message),
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", id]);
      setCustomMessage("");
    },
  });

  const handleProofSubmit = async () => {
    if (!proofFile) {
      toast.error("Please select a screenshot");
      return;
    }
    if (!utrNumber.trim()) {
      toast.error("Please enter the UTR number");
      return;
    }

    setUploading(true);
    try {
      const screenshotUrl = await upload(proofFile);
      submitProofMutation.mutate({ screenshot: screenshotUrl, utr: utrNumber });
    } catch (err) {
      toast.error("Failed to upload screenshot");
    } finally {
      setUploading(false);
    }
  };

  const handleSendTemplate = (text) => {
    sendMessageMutation.mutate({ conversationId: id, desc: text });
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!customMessage.trim()) return;
    sendMessageMutation.mutate({ conversationId: id, desc: customMessage });
  };

  const isSeller = conversation?.userRole === 'seller';
  const isBuyer = conversation?.userRole === 'buyer';
  const canMessage = conversation?.canUserMessage;
  const isChatOpen = conversation?.isChatOpen;
  const proofStatus = conversation?.proof?.status;
  const hasProof = !!conversation?.proof?.screenshot;

  // Default templates
  const defaultTemplates = [
    "✅ Payment verified! Processing your order now.",
    "📦 Your item has been dispatched.",
    "⏰ I'll be available for chat in 10 minutes.",
    "❌ Payment not received. Please check and try again.",
  ];

  const templates = conversation?.templates || defaultTemplates;

  return (
    <div className="message">
      <ToastContainer position="top-center" />
      <div className="container">
        {/* Header */}
        <div className="chat-header">
          <span className="breadcrumbs">
            <Link to="/messages">Messages</Link> &gt; 
            <span>{isSeller ? "Buyer" : "Seller"} Chat</span>
          </span>
          
          {/* Timer Display */}
          {conversation?.chatAccess?.chatCloseAt && (
            <div className={`timer ${timeLeft < 300000 ? 'urgent' : ''}`}>
              <span className="timer-label">⏱️ Chat closes in:</span>
              <span className="timer-value">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Status Banner */}
        <div className={`status-banner ${proofStatus || 'pending'}`}>
          {proofStatus === 'verified' && <span>✅ Payment Verified - Chat Active</span>}
          {proofStatus === 'rejected' && <span>❌ Payment Rejected - Please resubmit</span>}
          {(!proofStatus || proofStatus === 'pending') && hasProof && <span>⏳ Proof Submitted - Awaiting Verification</span>}
          {(!hasProof && isBuyer) && <span>📎 Please submit payment proof to start chat</span>}
          {(!hasProof && isSeller) && <span>⏳ Waiting for buyer to submit payment proof</span>}
        </div>

        {/* Proof Section */}
        {hasProof && (
          <div className="proof-section">
            <h3>Payment Proof</h3>
            <div className="proof-content">
              <img 
                src={conversation.proof.screenshot} 
                alt="Payment Proof" 
                className="proof-image"
                onClick={() => window.open(conversation.proof.screenshot, '_blank')}
              />
              <div className="proof-details">
                <p><strong>UTR Number:</strong> {conversation.proof.utr}</p>
                <p><strong>Submitted:</strong> {new Date(conversation.proof.submittedAt).toLocaleString()}</p>
                <p><strong>Status:</strong> 
                  <span className={`status ${proofStatus}`}>
                    {proofStatus?.toUpperCase() || 'PENDING'}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Seller Verification Controls */}
            {isSeller && proofStatus === 'pending' && (
              <div className="verification-controls">
                <div className="duration-select">
                  <label>Chat Duration:</label>
                  <select value={durationInput} onChange={(e) => setDurationInput(Number(e.target.value))}>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={240}>4 hours</option>
                    <option value={1440}>24 hours</option>
                  </select>
                </div>
                <button 
                  className="verify-btn"
                  onClick={() => verifyProofMutation.mutate({ status: 'verified', durationMinutes: durationInput })}
                >
                  ✅ Verify & Enable Chat
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => verifyProofMutation.mutate({ status: 'rejected' })}
                >
                  ❌ Reject Proof
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submit Proof Form (Buyer only, if not submitted) */}
        {isBuyer && !hasProof && (
          <div className="proof-form">
            <h3>Submit Payment Proof</h3>
            <div className="form-group">
              <label>Payment Screenshot</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files[0])}
              />
              {proofFile && (
                <img 
                  src={URL.createObjectURL(proofFile)} 
                  alt="Preview" 
                  className="preview-image"
                />
              )}
            </div>
            <div className="form-group">
              <label>UTR/Transaction Number</label>
              <input 
                type="text" 
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="Enter UTR number from payment"
              />
            </div>
            <button 
              className="submit-proof-btn"
              onClick={handleProofSubmit}
              disabled={uploading || submitProofMutation.isLoading}
            >
              {uploading ? "Uploading..." : submitProofMutation.isLoading ? "Submitting..." : "📎 Submit Proof"}
            </button>
          </div>
        )}

        {/* Seller Chat Controls */}
        {isSeller && (
          <div className="seller-controls">
            <h3>Chat Controls</h3>
            <div className="control-row">
              <span>Allow Buyer Messages:</span>
              <div className="duration-select">
                <select value={durationInput} onChange={(e) => setDurationInput(Number(e.target.value))}>
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
              <button 
                className={conversation?.chatAccess?.buyerCanMessage ? 'disable-btn' : 'enable-btn'}
                onClick={() => toggleChatMutation.mutate({ 
                  enable: !conversation?.chatAccess?.buyerCanMessage,
                  durationMinutes: durationInput 
                })}
              >
                {conversation?.chatAccess?.buyerCanMessage ? '🔒 Disable Chat' : '🔓 Enable Chat'}
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {isLoading ? (
          <div className="loading">Loading messages...</div>
        ) : error ? (
          <div className="error">Error loading messages</div>
        ) : (
          <div className="messages">
            {messages?.length === 0 && (
              <div className="empty-state">
                <p>No messages yet</p>
                {isBuyer && !canMessage && <p>Submit payment proof and wait for seller verification to start chatting</p>}
              </div>
            )}
            {messages?.map((m) => (
              <div 
                className={m.userId === currentUser._id ? "owner item" : "item"} 
                key={m._id}
              >
                <img
                  src={m.userId === currentUser._id ? currentUser.img || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100" : "/img/noavatar.jpg"}
                  alt=""
                />
                <div className="message-content">
                  <p>{m.desc}</p>
                  <span className="timestamp">{new Date(m.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Templates */}
        {canMessage && templates.length > 0 && (
          <div className="templates-section">
            <h4>Quick Messages</h4>
            <div className="template-buttons">
              {templates.map((template, idx) => (
                <button 
                  key={idx} 
                  className="template-btn"
                  onClick={() => handleSendTemplate(template)}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        {canMessage ? (
          <form className="write" onSubmit={handleSendCustom}>
            <textarea 
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={isBuyer ? "Type your message to seller..." : "Type your message to buyer..."}
              rows="3"
            />
            <button 
              type="submit" 
              disabled={!customMessage.trim() || sendMessageMutation.isLoading}
            >
              {sendMessageMutation.isLoading ? 'Sending...' : 'Send ➤'}
            </button>
          </form>
        ) : (
          <div className="locked-input">
            {isBuyer ? (
              <p>🔒 Chat is locked. {hasProof ? 'Waiting for seller to verify your payment.' : 'Submit payment proof above.'}</p>
            ) : (
              <p>💬 Enable chat to allow buyer to message you</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;