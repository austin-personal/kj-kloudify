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
import mermaid from "mermaid";

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
      try {
        // 1. Mermaid 다이어그램을 SVG 문자열로 생성
        let { svg } = await mermaid.render(
          "generatedChart",
          finishData.join("\n")
        );

        // 2. XML 네임스페이스가 없을 경우 추가
        if (!svg.includes("xmlns")) {
          svg = svg.replace(
            "<svg ",
            '<svg xmlns="http://www.w3.org/2000/svg" '
          );
        }
        console.log("안녕!");

        // 3. SVG 문자열을 Blob으로 변환
        const svgBlob = new Blob([svg], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        // 4. `Image` 객체에 Blob URL 로드
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            // 5. 캔버스를 PNG로 변환하여 다운로드
            const canvasDataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = canvasDataUrl;
            link.download = `architecture_screenshot_${cid}.png`;
            link.click();
          }
          // URL 정리
          URL.revokeObjectURL(url);
        };

        img.onerror = (error) => {
          console.error("Error loading SVG image for canvas:", error);
        };
      } catch (error) {
        console.error("Screenshot capture failed:", error);
      }
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
