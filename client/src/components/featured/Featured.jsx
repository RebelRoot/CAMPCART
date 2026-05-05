import React, { useState } from "react";
import "./Featured.scss";
import { useNavigate } from "react-router-dom";

function Featured() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate(`/gigs?search=${input}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="featured">
      <div className="container">
        <div className="left">
          <div className="badge">
            <span className="pulse"></span>
            <span>1,200+ transactions this semester</span>
          </div>
          <div className="title">
            <h1>
              Your Campus,<br />
              Your <span className="highlight">Marketplace</span>
            </h1>
          </div>
          <p className="subtitle">
            Buy textbooks, sell electronics, get tutoring, order late-night food — all from students you trust.
          </p>
          <div className="search">
            <div className="searchInput">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                placeholder="Search for books, electronics, tutoring..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button onClick={handleSubmit}>Search</button>
          </div>
          <div className="popular">
            <span>Trending:</span>
            <button onClick={() => navigate("/gigs?cat=books")}>Used Books</button>
            <button onClick={() => navigate("/gigs?cat=electronics")}>Laptops</button>
            <button onClick={() => navigate("/gigs?cat=tutoring")}>Tutoring</button>
            <button onClick={() => navigate("/gigs?cat=food")}>Late Night Food</button>
          </div>
          <div className="stats">
            <div className="stat">
              <strong>2,400+</strong>
              <span>Active Sellers</span>
            </div>
            <div className="divider"></div>
            <div className="stat">
              <strong>4.9</strong>
              <span>Avg Rating</span>
            </div>
            <div className="divider"></div>
            <div className="stat">
              <strong>50+</strong>
              <span>Campuses</span>
            </div>
          </div>
        </div>
        <div className="right">
          <div className="hero-visual">
            <img src="./img/mman.png" alt="Campus marketplace" />
            <div className="floating-card card-1">
              <div className="icon">📚</div>
              <div className="text">
                <strong>Textbook sold!</strong>
                <span>Just now</span>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="icon">⭐</div>
              <div className="text">
                <strong>5.0 Rating</strong>
                <span>+12 reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Featured;
