// Review.tsx
import React, { useRef, useState } from "react";
import Services from "../../components/Services/Services";
import Toast from "../../components/Toast/Toast";
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
  const { pid: pidParam } = useParams<{ pid: string }>();
  const cid = cidParam ? parseInt(cidParam, 10) : null;
  const pid = pidParam ? parseInt(pidParam, 10) : null;
  const [showOptions, setShowOptions] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const mermaidRef = useRef<HTMLDivElement>(null); // MermaidChart 요소를 참조할 ref 추가
  const token = localStorage.getItem("token") ?? "";
  const [isTerraformVisible, setIsTerraformVisible] = useState(false);
  dispatch(setHasSecret(true));

  const handleCheckboxChange = () => {
    setIsTerraformVisible(!isTerraformVisible); // 상태 토글
  };

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
        <div className="container">
          <input
            type="checkbox"
            className="checkbox"
            id="checkbox"
            onChange={handleCheckboxChange}
          />
          <label className="switch" htmlFor="checkbox">
            <span className="slider"></span>
          </label>
        </div>
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

              <div className="tooltip">환경 설정중입니다. 기다려 주세요.</div>
            </button>
          )}
        </div>
        {isTerraformVisible ? (
          <div className="terraform-code">
            <div className="code"></div>
          </div>
        ) : (
          <div ref={mermaidRef} className="mermaid-chart">
            <MermaidChart chartCode={finishData} />
          </div>
        )}
      </div>

      <div className="vertical-line"></div>
      <Services
        cid={cid ?? 0}
        pid={pid ?? 0}
        isReviewReady={isReviewReady}
        chartCode={finishData}
      />
      <div>
        {showToast && (
          <Toast
            message={
              isReviewReady
                ? "생성이 완료되었습니다.\n이제 배포할 준비가 되었습니다!"
                : "테라폼 코드 생성 중입니다...\n잠시만 기다려주세요."
            }
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Review;
