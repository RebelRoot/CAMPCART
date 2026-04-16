import React from "react";
import "./GigCard.scss";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const GigCard = ({ item }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["user", item.userId],
    queryFn: () =>
      newRequest.get(`/users/${item.userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!item.userId,
  });

  // Calculate rating safely
  const rating = item.starNumber > 0 
    ? Math.round(item.totalStars / item.starNumber) 
    : 0;

  return (
    <Link to={`/gig/${item._id}`} className="link">
      {isLoading ? (
        <div className="gigCard shimmer">
          <div className="img-placeholder"></div>
          <div className="info-placeholder"></div>
        </div>
      ) : (
        <div className="gigCard">
          <img className="cover" src={item.cover || "/img/noimage.jpg"} alt={item.title} />
          <div className="info">
            <div className="user">
              <img src={data?.img || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100"} alt="" />
              <span>{data?.username || "Unknown User"}</span>
            </div>
            <p>{item.title}</p>
            <div className="star">
              <img src="./img/star.png" alt="" />
              <span>{rating > 0 ? rating : "New"}</span>
            </div>
            {item.condition && (
              <span className="condition">{item.condition}</span>
            )}
          </div>
          <div className="detail">
            <img className="heart" src="./img/heart.png" alt="" />
            <div className="price">
              <span>STARTING AT</span>
              <h2>₹ {item.price}</h2>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

export default GigCard;
