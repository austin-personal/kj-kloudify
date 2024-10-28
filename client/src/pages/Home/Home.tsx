import React, { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/SideBar/SideBar";
import Chat from "../../components/Chat/Chat";
import Board from "../../components/Board/Board";
import "./Home.css";
import { projectOneInfo } from "../../services/projects";

interface Project {
  PID: number;
  CID: number;
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
  const [finishData, setFinishData] = useState<string[]>([]);
  const [nodes, setNodes] = useState<any[]>([]); //board에 있던 node 상태 끌어올림

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

  // 세션 스토리지에 상태 저장
  const saveNodesToSession = () => {
    sessionStorage.setItem("nodes", JSON.stringify(nodes));
    console.log("노드 상태가 세션 스토리지에 저장되었습니다.");
  };
  const handleFinish = () => {
    saveNodesToSession();
    navigate(`/review/${project?.CID}`);
  };

  // Chat 컴포넌트로부터 파싱된 데이터를 받는 함수
  const handleParsedData = (data: string[]) => {
    console.log("Chat 컴포넌트로부터 받은 파싱된 데이터:", data);
    setParsedData(data);
  };
  const handleFinishData = (data: string[]) => {
    console.log("Chat 컴포넌트로부터 받은 파싱된 마무리 데이터:", data);
    setFinishData(data);
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
        projectCID={project.CID}
        onParsedData={handleParsedData} // 새로운 prop 전달
        onFinishData={handleFinishData}
      />
      <div className="vertical-line"></div>
      <div className="right-side">
        <div className="project-name-container">
          <h1 className="project-name">Project:{project.projectName}</h1>
        </div>
        <div className="setting-container">
          <div className="setting-services set-up-complete">2</div>
          <div className="setting-services setting-in-progress">2</div>
        </div>
        <ReactFlowProvider>
          <Board parsedData={parsedData} nodes={nodes} setNodes={setNodes} />
        </ReactFlowProvider>
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
