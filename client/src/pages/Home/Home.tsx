import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar/SideBar";
import Chat from "../../components/Chat/Chat";
import Board from "../../components/Board/Board";
import "./Home.css";

interface HomeProps {
  projectName: string;
  projectCID: string;
}

const Home: React.FC<HomeProps> = ({ projectName, projectCID }) => {
  // 상태 끌어올리기
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSummary, setIsOpenSummary] = useState(false);
  const navigate = useNavigate();

  const togglePopup = () => {
    setIsOpenSummary(!isOpenSummary);
  };

  const handleFinish = () => {
    navigate("/review");
  };

  // 파싱된 데이터를 저장하는 상태 변수
  const [parsedData, setParsedData] = useState<string[]>([]);

  // Chat 컴포넌트로부터 파싱된 데이터를 받는 함수
  const handleParsedData = (data: string[]) => {
    console.log("Chat 컴포넌트로부터 받은 파싱된 데이터:", data);
    setParsedData(data);
  };

  return (
    <div className="home">
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Chat
        setIsOpen={setIsOpen}
        projectCID={projectCID}
        onParsedData={handleParsedData} // 새로운 prop 전달
      />
      <div className="vertical-line"></div>
      <div className="right-side">
        <h1 className="project-name">Project:{projectName}</h1>
        <Board parsedData={[]} />
        <div className="setting-container">
          <div className="setting-services set-up-complete">2</div>
          <div className="setting-services setting-in-progress">2</div>
        </div>
        <div
          className={`popup ${isOpenSummary ? "visible" : "hidden"}`}
          onClick={togglePopup}
        >
          {!isOpenSummary ? "Summary" : "Close"}
          {isOpenSummary && (
            <div className="extra-content">
              <p>확장된 영역의 추가 텍스트 1</p>
            </div>
          )}
        </div>
        <button onClick={handleFinish} className="review-btn">
          Finish & Review
        </button>
      </div>
    </div>
  );
};

export default Home;
