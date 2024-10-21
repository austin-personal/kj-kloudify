import React, { useState } from "react";
import SideBar from "../../components/SideBar/SideBar";
import Chat from "../../components/Chat/Chat";
import Board from "../../components/Board/Board";
import "./Home.css";

function Home() {
  //상태 끌어올리기
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSummary, setIsOpenSummary] = useState(false);
  const togglePopup = () => {
    setIsOpenSummary(!isOpenSummary); // 현재의 isOpen 상태를 반대로 설정
  };
  return (
    <div className="home">
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Chat setIsOpen={setIsOpen} />
      <div className="vertical-line"></div>
      <div className="right-side">
        <h1 className="project-name">Project: Namanmu</h1>
        <Board />
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
        <button className="review-btn">Finish & Review</button>
      </div>
    </div>
  );
}

export default Home;
