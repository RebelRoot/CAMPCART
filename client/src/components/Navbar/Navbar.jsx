import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  const { pathname } = useLocation();

  const isActive = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const navigate = useNavigate();

  const { isLoading, data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
    enabled: !!currentUser,
    refetchInterval: 5000, // Poll every 5s for live effect
  });

  const unreadCount = conversations?.filter((c) => 
    currentUser?.isSeller ? !c.readBySeller : !c.readByBuyer
  ).length || 0;

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.setItem("currentUser", null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={active || pathname !== "/" ? "navbar active" : "navbar"}>
      <div className="container">
        <div className="logo" onClick={() => setShow(false)}>
          <Link className="link" to="/">
            <span className="text">CampCart</span>
            <span className="dot">.</span>
          </Link>
        </div>
        {show && <div className="backdrop" onClick={() => setShow(false)}></div>}
        <div className="hamburger" onClick={() => setShow(!show)}>
          <img src="./img/hamburger.png" alt="" />
        </div>
        <div className={`links ${show ? "show" : ""}`}>
          <Link to="/verified-stores" className="link" onClick={() => setShow(false)}>
            <span>Verified Stores</span>
          </Link>
          <span onClick={() => setShow(false)}>Hostel Delivery</span>
          <Link to="/gigs" className="link" onClick={() => setShow(false)}>
            <span>Explore</span>
          </Link>
          <Link to="/schemes" className="link" onClick={() => setShow(false)}>
            <span>Schemes & Exams</span>
          </Link>
          {currentUser?.isVerifiedStore && (
            <Link to="/dashboard" className="link">
              <span>Store Dashboard</span>
            </Link>
          )}
          {['admin', 'root', 'giga'].includes(currentUser?.role) && (
            <Link to="/admin-panel" className="link">
              <span>Admin Panel</span>
            </Link>
          )}
          {!currentUser?.isSeller && <span>Sell Items</span>}
          {currentUser ? (
            <div className="user" onClick={() => setOpen(!open)}>
              <img src={currentUser.img || "/img/user.jpg"}  alt="" />
              <span>{currentUser?.username}</span>
              {open && (
                <div className="options">
                  <div className="wallet-info">
                    <div className="wallet-icon">
                      <img src="/img/campcash-logo.png" alt="wallet" />
                    </div>
                    <div className="wallet-details">
                      <span className="wallet-label">Camp Cash</span>
                      <span className="wallet-balance">₹{currentUser?.campCash || 0}</span>
                    </div>
                  </div>
                  <hr className="wallet-divider" />
                  {currentUser.isSeller && (
                    <>
                      <Link className="link" to="/mygigs">
                        My Listings
                      </Link>
                      <Link className="link" to="/add">
                        Sell Item/Service
                      </Link>
                    </>
                  )}
                  <Link className="link" to="/orders">
                    Orders
                  </Link>
                  <Link className="link" to="/messages">
                    Messages {unreadCount > 0 && <span className="counter">{unreadCount}</span>}
                  </Link>
                  <Link className="link" to="/profile" onClick={() => setShow(false)}>
                    View Profile
                  </Link>
                  <Link className="link" to="/edit-profile" onClick={() => setShow(false)}>
                    Edit Account
                  </Link>
                  <Link className="link" onClick={handleLogout}>
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="link">
                Sign in
              </Link>
              <Link className="link" to="/register">
                <button>Join</button>
              </Link>
            </>
          )}
        </div>
      </div>
      {(active || pathname !== "/") && (
        <>
          <hr />
          <div className="menu">
            <Link className="link menuLink" to="/gigs?cat=books">
              Used Books
            </Link>
            <Link className="link menuLink" to="/gigs?cat=electronics">
              Electronics
            </Link>
            <Link className="link menuLink" to="/gigs?cat=furniture">
              Furniture
            </Link>
            <Link className="link menuLink" to="/gigs?cat=tutoring">
              Tutoring
            </Link>
            <Link className="link menuLink" to="/gigs?cat=assignments">
              Assignments
            </Link>
            <Link className="link menuLink" to="/gigs?cat=food">
              Late Night Food
            </Link>
            <Link className="link menuLink" to="/gigs?cat=design">
              Design Help
            </Link>
            <Link className="link menuLink" to="/gigs?cat=coding">
              Coding Help
            </Link>
            <Link className="link menuLink" to="/gigs?cat=essentials">
              Hostel Essentials
            </Link>
          </div>
          <hr />
        </>
      )}
    </div>
  );
}

export default Navbar;
