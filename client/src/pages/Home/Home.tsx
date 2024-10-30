import React, { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/SideBar/SideBar";
import Chat from "../../components/Chat/Chat";
import Board from "../../components/Board/Board";
import "./Home.css";
import { projectOneInfo } from "../../services/projects";
import { review } from "../../services/terraforms";

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
  const [project, setProject] = useState<Project | null>(null);
  const [parsedData, setParsedData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
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

  const handleFinish = async () => {
    try {
      const response = await review(Number(pid), token); // cid를 이용해 review 호출
      console.log("review API 호출 성공:", response);
      navigate(`/review/${project?.CID}`);
    } catch (error) {
      console.error("review API 호출 실패:", error);
    }
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
      {/* 슬라이드바 삭제 */}
      {/* <SideBar isOpen={isOpen} setIsOpen={setIsOpen} /> */}
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

        <ReactFlowProvider>
          <Board parsedData={parsedData} finishData={finishData} />
        </ReactFlowProvider>
        <div className="review-btn-container">
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
    </div>
  );
};

export default Home;
