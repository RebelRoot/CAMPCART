import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="brand-col">
            <div className="logo">
              <span className="text">CampCart</span>
              <span className="dot">.</span>
            </div>
            <p className="tagline">
              The #1 campus marketplace for students. Buy, sell, and connect with your college community.
            </p>
            <div className="newsletter">
              <input type="email" placeholder="Your email address" />
              <button>Subscribe</button>
            </div>
            <div className="social">
              <a href="#" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          <div className="links-grid">
            <div className="item">
              <h3>Categories</h3>
              <Link to="/gigs?cat=books">Used Books</Link>
              <Link to="/gigs?cat=electronics">Electronics</Link>
              <Link to="/gigs?cat=furniture">Furniture</Link>
              <Link to="/gigs?cat=tutoring">Tutoring</Link>
              <Link to="/gigs?cat=food">Late Night Food</Link>
              <Link to="/gigs?cat=essentials">Hostel Essentials</Link>
            </div>
            <div className="item">
              <h3>Company</h3>
              <a href="#">About Us</a>
              <a href="#">Press & News</a>
              <a href="#">Careers</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            <div className="item">
              <h3>Support</h3>
              <a href="#">Help Center</a>
              <a href="#">Trust & Safety</a>
              <a href="#">Selling Guide</a>
              <a href="#">Buying Guide</a>
              <a href="#">Contact Us</a>
            </div>
            <div className="item">
              <h3>Community</h3>
              <a href="#">Blog</a>
              <a href="#">Events</a>
              <a href="#">Forum</a>
              <a href="#">Become a Seller</a>
              <a href="#">Invite Friends</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <span>&copy; 2026 CampCart. All rights reserved.</span>
          </div>
          <div className="badges">
            <span className="badge">🔒 Secure Payments</span>
            <span className="badge">✓ Verified Sellers</span>
            <span className="badge">🛡️ Buyer Protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
