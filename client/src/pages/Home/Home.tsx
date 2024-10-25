import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/SideBar/SideBar";
import Chat from "../../components/Chat/Chat";
import Board from "../../components/Board/Board";
import "./Home.css";
import { projectOneInfo } from "../../services/projects";

interface Project {
  PID: number;
  CID: string;
  UID: number;
  ARCTID: number;
  projectName: string;
  createdDate: string;
  services: {
    id: number;
    name: string;
    status: string;
    price: number;
  }[];
  previousChats: string[];
}

const Home: React.FC = () => {
  // 상태 끌어올리기
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSummary, setIsOpenSummary] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [parsedData, setParsedData] = useState<string[]>([]);

  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();

  // 프로젝트 정보를 가져오는 함수
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (pid) {
          const token = localStorage.getItem("token"); // 토큰을 로컬 스토리지에서 가져옴
          if (token) {
            const response = await projectOneInfo(Number(pid), token);
            setProject(response.data);
          } else {
            console.error("토큰이 없습니다. 인증 문제가 발생할 수 있습니다.");
          }
        }
      } catch (error) {
        console.error("프로젝트 정보를 가져오는 중 오류 발생:", error);
      }
    };

    fetchProjectData();
  }, [pid]);

  const togglePopup = () => {
    setIsOpenSummary(!isOpenSummary);
  };

  const handleFinish = () => {
    navigate("/review");
  };

  // Chat 컴포넌트로부터 파싱된 데이터를 받는 함수
  const handleParsedData = (data: string[]) => {
    console.log("Chat 컴포넌트로부터 받은 파싱된 데이터:", data);
    setParsedData(data);
  };

  // 프로젝트 없으면 profile로 소환
  // 나중에는 경고알람으로 create project하라고 하면 좋을 것 같음.
  if (!project) {
    navigate("/profile"); // 로딩 상태 표시
    return <></>;
  }

  return (
    <div className="home">
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Chat
        setIsOpen={setIsOpen}
        projectCID={project.CID}
        onParsedData={handleParsedData} // 새로운 prop 전달
      />
      <div className="vertical-line"></div>
      <div className="right-side">
        <div className="project-name-container">
          <h1 className="project-name">Project:{projectName}</h1>
        </div>
        <div className="setting-container">
          <div className="setting-services set-up-complete">2</div>
          <div className="setting-services setting-in-progress">2</div>
        </div>

        <Board parsedData={parsedData} />
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
