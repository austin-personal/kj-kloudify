import React from "react";
import Board from "../../components/Board/Board";
import Services from "../../components/Services/Services";
import "./Review.css";

function Review() {
  return (
    <div className="review">
      <Board
        height="600px"
        borderRadius="20px 20px 20px 20px"
        myServices={["apple", "banana", "cherry"]}
      />
      <div className="vertical-line"></div>
      <Services />
    </div>
  );
}

export default Review;
