// Review.tsx
import React, { useRef, useState } from "react";
import Services from "../../components/Services/Services";
import "./Review.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowDown } from "@fortawesome/free-solid-svg-icons";
import { download } from "../../services/terraforms";
import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import MermaidChart from "../../components/Mermaid/mermaid";
import { setHasSecret } from "../../store/loadingSlice";
const domtoimage = require("dom-to-image");

const Review: React.FC = () => {
  const dispatch = useAppDispatch();
  const isReviewReady = useAppSelector((state) => state.loading.isReviewReady);
  const finishData = useAppSelector((state) => state.finishData.finishData);
  const { cid: cidParam } = useParams<{ cid: string }>();
  const cid = cidParam ? parseInt(cidParam, 10) : null;
  const [showOptions, setShowOptions] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null); // MermaidChart 요소를 참조할 ref 추가
  const token = localStorage.getItem("token") ?? "";

  dispatch(setHasSecret(true));

  const handleScreenshot = async () => {
    if (mermaidRef.current) {
      // div 요소를 PNG 이미지로 변환
      domtoimage
        .toPng(mermaidRef.current)
        .then((dataUrl: string) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "capture.png";
          link.click();
        })
        .catch((error: any) => {
          console.error("Error capturing image:", error);
        });
    }
  };

  const handleMouseEnter = () => {
    setShowOptions(true);
  };

  const handleMouseLeave = () => {
    setShowOptions(false);
  };

  const handleDownload = async () => {
    if (cid !== null) {
      try {
        const data = await download(cid, token);
        const blob = new Blob([data], { type: "text/plain" });
        const fileURL = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = fileURL;
        link.download = `terraform_code_${cid}.tf`;
        link.click();

        URL.revokeObjectURL(fileURL);
      } catch (error) {
        console.error("Terraform code download failed:", error);
      }
    }
  };

  return (
    <div className="review">
      <div className="review-board">
        <div className="download">
          {isReviewReady ? (
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
                <button onClick={() => handleDownload()}>Terraform Code</button>
                <button onClick={handleScreenshot}>Architecture</button>
              </div>
            </div>
          ) : (
            <button className="download-button loading" disabled>
              <div className="spinner"></div>
            </button>
          )}
        </div>
        <div ref={mermaidRef} className="mermaid-chart">
          <MermaidChart chartCode={finishData}></MermaidChart>
        </div>
      </div>

      <div className="vertical-line"></div>
      <Services cid={cid ?? 0} isReviewReady={isReviewReady} />
    </div>
  );
};

export default Review;
