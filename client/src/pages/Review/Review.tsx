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

const Review: React.FC = () => {
  const dispatch = useAppDispatch();
  const isReviewReady = useAppSelector((state) => state.loading.isReviewReady);
  const finishData = useAppSelector((state) => state.finishData.finishData);
  const { cid: cidParam } = useParams<{ cid: string }>(); // useParams로 cid 가져오기
  const cid = cidParam ? parseInt(cidParam, 10) : null; // cid가 존재할 때만 number로 변환
  const [showOptions, setShowOptions] = useState(false);
  const boardRef = useRef<{ takeScreenshot: () => void } | null>(null);
  const token = localStorage.getItem("token") ?? "";

  //review 페이지면 무조건 키가 있어야 함.
  dispatch(setHasSecret(true));

  const handleScreenshot = () => {
    if (boardRef.current) {
      boardRef.current.takeScreenshot();
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
        // 백엔드 API 호출
        const data = await download(cid, token);

        // 데이터를 Blob으로 변환
        const blob = new Blob([data], { type: "text/plain" }); // 다운로드 파일의 MIME 타입 설정
        const fileURL = URL.createObjectURL(blob);

        // 다운로드 링크 생성 및 트리거
        const link = document.createElement("a");
        link.href = fileURL;
        link.download = `terraform_code_${cid}.tf`; // 다운로드 파일명 설정
        link.click();

        // 메모리 정리
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
        <MermaidChart chartCode={finishData}></MermaidChart>
      </div>

      <div className="vertical-line"></div>
      <Services cid={cid ?? 0} isReviewReady={isReviewReady} />
    </div>
  );
};

export default Review;
