import React, { useState } from "react";
import Board from "../../components/Board/Board";
import Services from "../../components/Services/Services";
import "./Review.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowDown } from "@fortawesome/free-solid-svg-icons";
function Review() {
  const [showOptions, setShowOptions] = useState(false);

  const handleMouseEnter = () => {
    setShowOptions(true);
  };

  const handleMouseLeave = () => {
    setShowOptions(false);
  };

  const handleDownload = (type: string) => {
    const fileUrl =
      type === "terraform"
        ? "/path/to/terraform.zip"
        : "/path/to/architecture.zip";
  };
  return (
    <div className="review">
      <div className="review-board">
        <Board
          height="100%"
          borderRadius="20px 20px 20px 20px"
          parsedData={[]}
        />
        <div className="download">
          <div
            className="download-container"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="download-button">
              <FontAwesomeIcon
                icon={faCloudArrowDown}
                className="download-icon"
              />
              Download
            </button>
            <div className={`download-options ${showOptions ? "show" : ""}`}>
              <button onClick={() => handleDownload("terraform")}>
                Terraform Code
              </button>
              <button onClick={() => handleDownload("architecture")}>
                Architecture
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="vertical-line"></div>
      <Services />
    </div>
  );
}

export default Review;
