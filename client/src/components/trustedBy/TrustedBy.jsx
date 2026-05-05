import React from "react";
import "./TrustedBy.scss";

const TrustedBy = () => {
  return (
    <div className="trustedBy">
      <div className="container">
        <span className="label">Trusted by students at</span>
        <div className="logos">
          <div className="logo-item">IIT Delhi</div>
          <div className="logo-item">BITS Pilani</div>
          <div className="logo-item">DTU</div>
          <div className="logo-item">SAITM</div>
          <div className="logo-item">NIT Trichy</div>
          <div className="logo-item">IIIT Hyderabad</div>
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;
