import React, { useState } from "react";
import "./SideBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
const SideBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // 현재의 isOpen 상태를 반대로 설정
  };

  return (
    <>
      {" "}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <p className="contents">자세한 설명 가나다라마바사아자차카타파아</p>
        <button onClick={toggleSidebar} className="toggle-btn">
          <FontAwesomeIcon icon={isOpen ? faChevronLeft : faChevronRight} />
        </button>
      </aside>
      {/* 오버레이 클릭 시 사이드바 닫기 */}
      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default SideBar;
