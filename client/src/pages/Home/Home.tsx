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
  isDeployed: boolean;
}

interface HomeProps {
  finishData: string[];
  setFinishData: React.Dispatch<React.SetStateAction<string[]>>;
}

const Home: React.FC<HomeProps> = ({ finishData, setFinishData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSummary, setIsOpenSummary] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [parsedData, setParsedData] = useState<string[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await projectOneInfo(Number(pid), token);
          setProject(response.data);

          if (response.data.isDeployed === true) {
            navigate("/profile");
          }
        } else {
          console.error("토큰이 없습니다. 인증 문제가 발생할 수 있습니다.");
        }
      } catch (error) {
        console.error("프로젝트 정보를 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    setParsedData([]);
    setFinishData([]);

    fetchProjectData();
  }, [pid, navigate]);

  useEffect(() => {
    if (!loading && !project) {
      navigate("/profile");
    }
  }, [loading, project, navigate]);

  const togglePopup = () => {
    setIsOpenSummary(!isOpenSummary);
  };

  const handleFinish = () => {
    navigate(`/review/${project?.CID}`);
  };

  const handleParsedData = (data: string[]) => {
    console.log("Chat 컴포넌트로부터 받은 파싱된 데이터:", data);
    setParsedData(data);
  };
  const handleFinishData = (data: string[]) => {
    console.log("Chat 컴포넌트로부터 받은 파싱된 마무리 데이터:", data);
    setFinishData(data);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home">
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Chat
        projectCID={project!.CID}
        onParsedData={handleParsedData}
        onFinishData={handleFinishData}
      />
      <div className="vertical-line"></div>
      <div className="right-side">
        <div className="project-name-container">
          <h1 className="project-name">Project: {project!.projectName}</h1>
        </div>
        <div className="setting-container">
          <div className="setting-services set-up-complete">2</div>
          <div className="setting-services setting-in-progress">2</div>
        </div>
        <ReactFlowProvider>
          <Board
            parsedData={parsedData}
            finishData={finishData}
            nodes={nodes}
            setNodes={setNodes}
          />
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
        <button
          onClick={handleFinish}
          className={`review-btn-${
            finishData.length === 0 ? "disabled" : "enabled"
          }`}
          disabled={finishData.length === 0}
        >
          Review
        </button>
      </div>
    </div>
  );
};

export default Home;
