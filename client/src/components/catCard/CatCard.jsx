import React from "react";
import { Link } from "react-router-dom";
import "./CatCard.scss";

function CatCard({ card }) {
  // Map category titles to API category values
  const catMap = {
    "Used Books": "books",
    "Electronics": "electronics",
    "Furniture": "furniture",
    "Tutoring": "tutoring",
    "Assignments": "assignments",
    "Late Night Food": "food",
    "Design Services": "design",
    "Coding Help": "coding",
    "Hostel Essentials": "essentials"
  };
  
  const cat = catMap[card.title] || "";
  
  return (
    <Link to={`/gigs?cat=${cat}`}>
      <div className="catCard">
        <img src={card.img} alt={card.title} />
        <span className="desc">{card.desc}</span>
        <span className="title">{card.title}</span>
      </div>
    </Link>
  );
}
export default CatCard;