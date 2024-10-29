import React, { useRef, useState, useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import Board from "../../components/Board/Board";
import Services from "../../components/Services/Services";
import "./Review.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowDown } from "@fortawesome/free-solid-svg-icons";
import { download, review } from "../../services/terraforms";
import { useParams } from "react-router-dom";

interface ReviewProps {
  finishData: string[];
}

const Review: React.FC<ReviewProps> = ({ finishData }) => {
  const { cid: cidParam } = useParams<{ cid: string }>(); // useParams로 cid 가져오기
  const cid = cidParam ? parseInt(cidParam, 10) : null; // cid가 존재할 때만 number로 변환
  const [showOptions, setShowOptions] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]); //node 정보 저장된 것 불러오기위해 상태끌어올림
  const boardRef = useRef<{ takeScreenshot: () => void } | null>(null);
  const token = localStorage.getItem("token") ?? "";

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

  useEffect(() => {
    const fetchReviewData = async () => {
      if (cid !== null && !isNaN(cid)) {
        try {
          const response = await review(cid, token); // cid를 이용해 review 호출
          console.log("review API 호출 성공:", response);
        } catch (error) {
          console.error("review API 호출 실패:", error);
        }
      }
    };

    // 항상 review API 호출하여 최신 데이터 불러오기
    fetchReviewData();
  }, []);

  return (
    <div className="review">
      <div className="review-board">
        <ReactFlowProvider>
          <Board
            ref={boardRef}
            height="100%"
            borderRadius="20px 20px 20px 20px"
            parsedData={[]}
            finishData={finishData}
          />
        </ReactFlowProvider>
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
              <button onClick={() => handleDownload()}>Terraform Code</button>
              <button onClick={handleScreenshot}>Architecture</button>
            </div>
          </div>
        </div>
      </div>

      <div className="vertical-line"></div>
      <Services nodes={nodes} cid={cid ?? 0} />
    </div>
  );
};

export default Review;
