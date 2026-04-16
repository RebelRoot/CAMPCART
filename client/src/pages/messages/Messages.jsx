import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
  });

  // Helper function to determine role in a specific conversation
  const getConversationRole = (conversation) => {
    if (conversation.sellerId === currentUser._id) return 'seller';
    if (conversation.buyerId === currentUser._id) return 'buyer';
    return 'unknown';
  };

  // Fetch user details for each conversation
  const { data: usersData } = useQuery({
    queryKey: ["conversationUsers", data?.map(c => {
      const role = getConversationRole(c);
      return role === 'seller' ? c.buyerId : c.sellerId;
    }).join(',')],
    queryFn: async () => {
      if (!data || data.length === 0) return {};
      const userIds = [...new Set(data.map(c => {
        const role = getConversationRole(c);
        return role === 'seller' ? c.buyerId : c.sellerId;
      }))];
      const users = {};
      await Promise.all(
        userIds.map(async (id) => {
          try {
            const res = await newRequest.get(`/users/${id}`);
            users[id] = res.data;
          } catch (err) {
            users[id] = { username: "Unknown User" };
          }
        })
      );
      return users;
    },
    enabled: !!data && data.length > 0,
  });

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="messages">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Messages</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Order Reference</th>
                <th>Last Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => {
                const myRole = getConversationRole(c);
                const otherUserId = myRole === 'seller' ? c.buyerId : c.sellerId;
                const otherUser = usersData?.[otherUserId];
                const hasProof = c.proof?.screenshot;
                const isUnread = (myRole === 'seller' && !c.readBySeller) ||
                                  (myRole === 'buyer' && !c.readByBuyer);
                
                return (
                  <tr
                    className={isUnread ? "active" : ""}
                    key={c.id}
                  >
                    <td>
                      <div className="user-cell">
                        <img 
                          src={otherUser?.img || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100"} 
                          alt="" 
                          className="avatar"
                        />
                        <span>{otherUser?.username || otherUserId?.substring(0, 8) + "..."}</span>
                      </div>
                    </td>
                    <td>
                      {c.orderId ? (
                        <span className="order-badge">
                          Order #{c.orderId.substring(c.orderId.length - 6)}
                        </span>
                      ) : (
                        <span className="order-badge general">General Chat</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/message/${c.id}`} className="link">
                        {hasProof && myRole === 'buyer' && c.proof?.status === 'pending' && (
                          <span className="proof-pending">⏳ Proof pending | </span>
                        )}
                        {hasProof && c.proof?.status === 'verified' && (
                          <span className="proof-verified">✅ Verified | </span>
                        )}
                        {c?.lastMessage?.substring(0, 80)}
                        {c?.lastMessage?.length > 80 ? "..." : ""}
                      </Link>
                    </td>
                    <td>
                      {hasProof && (
                        <span className={`proof-status ${c.proof?.status || 'pending'}`}>
                          {c.proof?.status === 'verified' ? 'Verified' : 
                           c.proof?.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      )}
                      {!hasProof && <span className="no-proof">No Proof</span>}
                    </td>
                    <td>{moment(c.updatedAt).fromNow()}</td>
                    <td>
                      {isUnread && (
                        <button onClick={() => handleRead(c.id)}>
                          Mark as Read
                        </button>
                      )}
                      <Link to={`/message/${c.id}`}>
                        <button className="view-btn">View Chat</button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Messages;