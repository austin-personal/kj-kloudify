import React from "react";
import "./NavBar.css";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCloud,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const NavBar: React.FC = () => {
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 이동
  };
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <FontAwesomeIcon
          icon={faArrowLeft}
          size="2xl"
          className="back-button"
          onClick={handleBackClick}
        />
        <button className="new-project-btn">+ New Project</button>
      </div>
      <div className="navbar-center">
        <FontAwesomeIcon icon={faCloud} size="2xl" className="navbar-icon" />
        <Link to="/home" className="navbar-logo">
          Kloudify
        </Link>
      </div>
      <div className="navbar-right">
        <Link to="/profile" className="profile-button">
          안녕하세요,OO님
        </Link>
        <Link to="/login" className="profile-button">
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="logout-button"
            size="2xl"
          />
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
