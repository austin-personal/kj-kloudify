import React, { useRef, useState, useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import Board from "../../components/Board/Board";
import Services from "../../components/Services/Services";
import "./Review.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowDown } from "@fortawesome/free-solid-svg-icons";
function Review() {
  const [showOptions, setShowOptions] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]); //node 정보 저장된 것 불러오기위해 상태끌어올림
  const boardRef = useRef<{ takeScreenshot: () => void } | null>(null);
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

  const handleDownload = (type: string) => {
    const fileUrl =
      type === "terraform"
        ? "/path/to/terraform.zip"
        : "/path/to/architecture.zip";
  };

  // 세션 스토리지에서 노드 데이터 불러오기
  useEffect(() => {
    const savedNodes = sessionStorage.getItem("nodes");
    if (savedNodes) {
      setNodes(JSON.parse(savedNodes));
      console.log("세션 스토리지에서 노드 상태를 불러왔습니다.");
    }
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
            nodes={nodes}
            setNodes={setNodes}
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
              <button onClick={() => handleDownload("terraform")}>
                Terraform Code
              </button>
              <button onClick={handleScreenshot}>Architecture</button>
            </div>
          </div>
        </div>
      </div>

      <div className="vertical-line"></div>
      <Services nodes={nodes} />
    </div>
  );
}

export default Review;
