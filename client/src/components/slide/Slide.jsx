import React from "react";
import "./Slide.scss";
import Slider from "infinite-react-carousel";

const Slide = ({ children, slidesToShow, arrowsScroll }) => {
  // Ensure slidesToShow is at least 1 to prevent "can not create array" error
  const safeSlidesToShow = Math.max(1, Number(slidesToShow) || 1);
  
  // Ensure children is a valid array with items
  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length === 0) {
    return null;
  }

  // Ensure arrowsScroll doesn't exceed item count
  const safeArrowsScroll = Math.min(arrowsScroll || 1, childrenArray.length);

  return (
    <div className="slide">
      <div className="container">
        <Slider slidesToShow={safeSlidesToShow} arrowsScroll={safeArrowsScroll}>
          {children}
        </Slider>
      </div>
    </div>
  );
};

export default Slide;