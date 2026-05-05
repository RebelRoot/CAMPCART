import React, { useState } from "react";
import "./Featured.scss";
import { useNavigate } from "react-router-dom";

function Featured() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate(`/gigs?search=${input}`);
  };
  return (
    <div className="featured">
      <div className="container">
        <div className="left">
          <div className="title">
            <h1>
              Buy, Sell & Learn on <span> Campus</span> - Your Student Marketplace
            </h1>
          </div>
          <div className="search">
            <div className="searchInput">
              <img src="./img/search.png" alt="" />
              <input
                type="text"
                placeholder="Search for books, electronics, tutoring..."
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <button onClick={handleSubmit}>Search</button>
          </div>
          <div className="popular">
            <span>Popular:</span>
            <button onClick={() => navigate("/gigs?cat=books")}>Used Books</button>
            <button onClick={() => navigate("/gigs?cat=electronics")}>Laptops</button>
            <button onClick={() => navigate("/gigs?cat=tutoring")}>Tutoring</button>
            <button onClick={() => navigate("/gigs?cat=food")}>Late Night Food</button>
          </div>
        </div>
        <div className="right">
          <img src="./img/mman.png" alt="" />
        </div>
      </div>
    </div>
  );
}

export default Featured;
