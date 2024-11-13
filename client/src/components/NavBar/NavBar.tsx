import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useAppSelector } from "../../store/hooks"; // 커스텀 훅 임포트
import "./NavBar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCloud,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { create } from "../../services/projects";
import { info } from "../../services/users";

const NavBar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지 상태
  const navigate = useNavigate(); // useNavigate 훅 사용
  const location = useLocation();
  const [userProfile, setUserProfile] = useState("");
  const hasSecret = useAppSelector((state) => state.loading.hasSecret);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          // 유저 정보 가져오기
          const userData = await info(token);
          setUserProfile(userData.user.username);
        } else {
          // 토큰이 없으면 로그인 페이지로 이동
          navigate("/");
        }
      } catch (error) {
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
  };

  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 이동
  };
  // 스크롤바 너비 계산 함수
  const getScrollbarWidth = () => {
    return window.innerWidth - document.documentElement.clientWidth;
  };
  // 모달이 열리면 body에 overflow: hidden 적용, 모달이 닫히면 제거
  useEffect(() => {
    if (isModalOpen) {
      const scrollbarWidth = getScrollbarWidth();
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`; // 스크롤바 너비만큼 패딩 추가
      // navbar 요소가 존재하는지 확인한 후 패딩 적용
      const navbar = document.querySelector(".navbar") as HTMLElement;
      if (navbar) {
        navbar.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "unset"; // 패딩 제거
      const navbar = document.querySelector(".navbar") as HTMLElement;
      if (navbar) {
        navbar.style.paddingRight = "unset"; // navbar 패딩 제거
      }
    }

    // cleanup when component unmounts
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "unset";
      const navbar = document.querySelector(".navbar") as HTMLElement;
      if (navbar) {
        navbar.style.paddingRight = "unset";
      }
    };
  }, [isModalOpen]);

  // 모달 열고 닫는 함수
  const handleNewProjectOpen = () => {
    if (!hasSecret) {
      alert("새로운 프로젝트를 생성하기 전 AWS Key 정보가 필요합니다.");
      navigate("/guide");
    } else {
      setIsModalOpen(true);
      setErrorMessage(""); // 모달 열 때 오류 메시지 초기화
    }
  };

  const handleNewProjectClose = () => {
    setIsModalOpen(false);
    setErrorMessage(""); // 모달 닫을 때 오류 메시지 초기화
  };

  const handleProjectSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const projectName = (event.target as HTMLFormElement).projectName.value;
    sessionStorage.removeItem("nodes"); // 세션 스토리지에서 노드 데이터 삭제

    // 프로젝트 이름 유효성 검사
    const projectNamePattern = /^[a-z0-9]+$/; // 영어와 숫자만 허용하는 정규식
    if (!projectNamePattern.test(projectName)) {
      setErrorMessage("영어 소문자와 숫자로 이루어진 프로젝트명을 입력해주세요");
      return; // 유효하지 않으면 함수 종료
    }

    //prohectName을 DB에 넘김
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("토큰이 존재하지 않습니다.");
      }
      const cid = await create(projectName, token); // token이 string임을 보장
      navigate(`/home/${cid}`);
      window.location.reload();
    } catch (error) {}
    setIsModalOpen(false); // 제출 후 모달을 닫기
  };

  const isProfilePage = location.pathname === "/profile";
  const isGuidePage = location.pathname === "/guide";

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          {!isProfilePage && (
            <FontAwesomeIcon
              icon={faArrowLeft}
              size="2xl"
              className="back-button"
              onClick={handleBackClick}
            />
          )}
          {!isGuidePage && (
            <button className="new-project-btn" onClick={handleNewProjectOpen}>
              + New Project
            </button>
          )}
        </div>
        <div className="navbar-center">
          <FontAwesomeIcon icon={faCloud} size="2xl" className="navbar-icon" />
          <Link to="/profile" className="navbar-logo">
            Kloudify
          </Link>
        </div>
        <div className="navbar-right">
          <Link to="/profile" className="profile-button">
            {`안녕하세요,${userProfile}님`}
          </Link>
          <Link to="/login" className="profile-button" onClick={handleLogout}>
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="logout-button"
              size="2xl"
            />
          </Link>
        </div>
      </nav>
      {isModalOpen &&
        ReactDOM.createPortal(
          <div className="new-project-modal">
            <div className="modal-content">
              <h2>Create New Project</h2>
              <form onSubmit={handleProjectSubmit}>
                <label htmlFor="projectName">
                  먼저, <span className="emphasis">영어 소문자</span>로 프로젝트 이름을
                  입력해주세요.
                </label>
                <input
                  className="projectName-input"
                  type="text"
                  id="projectName"
                  name="projectName"
                  required
                />
                {/* 오류 메시지 표시 */}
                {errorMessage && (
                  <p className="error-message">{errorMessage}</p>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleNewProjectClose}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body // 모달을 body 아래에 렌더링
        )}
    </>
  );
};

export default NavBar;
