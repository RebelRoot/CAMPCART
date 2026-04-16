import React from "react";
import "./Verified.scss";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { Link } from "react-router-dom";

const Verified = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["verifiedStores"],
    queryFn: () => newRequest.get("/users/verified").then((res) => res.data),
  });

  return (
    <div className="verified">
      <div className="container">
        <div className="header">
          <h1>Verified Stores</h1>
          <p>
            Exclusive marketplaces managed by student entrepreneurs and local
            vendors, officially verified by the CampCart Founder team for quality
            and reliability.
          </p>
        </div>

        {isLoading ? (
          "Loading stores..."
        ) : error ? (
          "Something went wrong!"
        ) : (
          <div className="store-grid">
            {data.map((store) => (
              <div className="store-card" key={store._id}>
                <div className="banner">
                  <img src={store.storeBanner || "/img/banner-placeholder.png"} alt="" />
                </div>
                <div className="content">
                  <img
                    className="avatar"
                    src={store.img || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100"}
                    alt=""
                  />
                  <div className="verified-badge">
                    <svg viewBox="0 0 20 20">
                      <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm4.59 7.41L10 12l-2.59-2.59-1.41 1.41L10 14.83l6-6-1.41-1.42z" />
                    </svg>
                    Verified Store
                  </div>
                  <h2>{store.storeName || store.username}</h2>
                  <p>{store.storeDescription || store.desc || "No description provided."}</p>
                  <Link to={`/gigs?userId=${store._id}`}>
                    <button>Visit Store</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verified;
