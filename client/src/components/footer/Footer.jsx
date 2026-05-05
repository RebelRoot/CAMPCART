import React from "react";
import "./Footer.scss";

function Footer() {
  return (
    <div className="footer">
      <div className="container">
        <hr />
        <div className="top">
          <div className="item">
            <h2>Categories</h2>
            <span>Used Books</span>
            <span>Electronics</span>
            <span>Furniture</span>
            <span>Tutoring</span>
            <span>Assignments</span>
            <span>Late Night Food</span>
            <span>Design Help</span>
            <span>Coding Help</span>
            <span>Hostel Essentials</span>
            <span>Sitemap</span>
          </div>
          <div className="item">
            <h2>About</h2>
            <span>Press & News</span>
            <span>Partnerships</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Intellectual Property Claims</span>
            <span>Investor Relations</span>
            <span>Contact Sales</span>
          </div>
          <div className="item">
            <h2>Support</h2>
            <span>Help & Support</span>
            <span>Trust & Safety</span>
            <span>Selling on Campus</span>
            <span>Buying on Campus</span>
          </div>
          <div className="item">
            <h2>Community</h2>
            <span>Customer Success Stories</span>
            <span>Community hub</span>
            <span>Forum</span>
            <span>Events</span>
            <span>Blog</span>
            <span>Influencers</span>
            <span>Affiliates</span>
            <span>Podcast</span>
            <span>Invite a Friend</span>
            <span>Become a Seller</span>
            <span>Community Standards</span>
          </div>
          <div className="item">
            <h2>More From Campus</h2>
            <span>Hostel Delivery</span>
            <span>Campus Pro</span>
            <span>Study Groups</span>
            <span>Campus Events</span>
            <span>Lost & Found</span>
            <span>Ride Sharing</span>
            <span>Internships</span>
            <span>Campus News</span>
            <span>Clubs</span>
            <span>Alumni</span>
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <h2>CampCart</h2>
            <span>© CampCart copyright 2026</span>
          </div>
          <div className="right">
            <div className="social">
              <img src="/img/twitter.png" alt="" />
              <img src="/img/facebook.png" alt="" />
              <img src="/img/linkedin.png" alt="" />
              <img src="/img/pinterest.png" alt="" />
              <img src="/img/instagram.png" alt="" />
            </div>
            <div className="link">
              <img src="/img/language.png" alt="" />
              <span>English</span>
            </div>
            <div className="link">
              <img src="/img/coin.png" alt="" />
              <span>USD</span>
            </div>
            <img src="/img/accessibility.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;