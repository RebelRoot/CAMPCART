import React, { useState } from "react";
import "./AdminPanel.scss";
import newRequest from "../../utils/newRequest";
import { useQuery } from "@tanstack/react-query";

const AdminPanel = () => {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const rolesHierarchy = { buyer: 1, seller: 1, giga: 2, root: 3, admin: 4 };
    const myRank = rolesHierarchy[currentUser?.role] || 0;

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["userSearch", query],
        queryFn: () => newRequest.get(`/users/search?username=${query}`).then(res => res.data),
        enabled: !!query,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setQuery(search);
    };

    const handleUpdateRole = async (userId, role, isVerifiedStore) => {
        try {
            await newRequest.put(`/users/${userId}/role`, { role, isVerifiedStore });
            alert("Updated successfully!");
            refetch();
        } catch (err) {
            alert(err.response?.data || "Something went wrong!");
        }
    };

    if (myRank < 2) return <div className="adminPanel"><div className="container"><h1>Access Denied</h1></div></div>;

    return (
        <div className="adminPanel">
            <div className="container">
                <div className="header">
                    <h1>Authority Management</h1>
                    <p>Search users by username to assign roles or verify stores. Your Rank: <span className={`role-badge ${currentUser.role}`}>{currentUser.role}</span></p>
                </div>

                <form className="search-box" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        placeholder="Search username (e.g. rahul...)" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button type="submit">Search User</button>
                </form>

                <div className="results">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Current Role</th>
                                <th>Store Status</th>
                                <th>New Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && <tr><td colSpan="5">Searching...</td></tr>}
                            {data?.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-info">
                                            <img src={user.img || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100"} alt="" />
                                            <div className="name-stack">
                                                <span>{user.username}</span>
                                                <span>{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.isVerifiedStore ? "seller" : "buyer"}`}>
                                            {user.isVerifiedStore ? "Verified Store" : "Standard"}
                                        </span>
                                    </td>
                                    <td>
                                        <select 
                                            defaultValue={user.role} 
                                            id={`role-${user._id}`}
                                            disabled={rolesHierarchy[user.role] >= myRank && currentUser.role !== 'admin'}
                                        >
                                            <option value="buyer">Buyer</option>
                                            <option value="seller">Seller</option>
                                            <option value="giga">Giga</option>
                                            {myRank >= 3 && <option value="root">Root</option>}
                                            {myRank >= 4 && <option value="admin">Admin</option>}
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', gap: '10px'}}>
                                            <button 
                                                className="update-btn"
                                                onClick={() => {
                                                    const role = document.getElementById(`role-${user._id}`).value;
                                                    handleUpdateRole(user._id, role, undefined);
                                                }}
                                                disabled={rolesHierarchy[user.role] >= myRank && currentUser.role !== 'admin'}
                                            >
                                                Set Role
                                            </button>
                                            <button 
                                                className="update-btn"
                                                onClick={() => handleUpdateRole(user._id, undefined, !user.isVerifiedStore)}
                                            >
                                                {user.isVerifiedStore ? "Unverify Store" : "Verify Store"}
                                            </button>
                                            <button 
                                                className="update-btn"
                                                style={{borderColor: "#EF4444", color: "#EF4444"}}
                                                onClick={async () => {
                                                    if (window.confirm("Are you sure you want to delete this account PERMANENTLY?")) {
                                                        try {
                                                            await newRequest.delete(`/users/${user._id}`);
                                                            alert("Deleted!");
                                                            refetch();
                                                        } catch (err) {
                                                            alert(err.response?.data || "Failed to delete");
                                                        }
                                                    }
                                                }}
                                                disabled={rolesHierarchy[user.role] >= myRank && currentUser.role !== 'admin'}
                                            >
                                                Delete User
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
