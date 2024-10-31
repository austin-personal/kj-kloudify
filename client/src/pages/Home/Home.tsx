import React, { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/SideBar/SideBar";
import Chat from "../../components/Chat/Chat";
import Board from "../../components/Board/Board";
import "./Home.css";
import { projectOneInfo } from "../../services/projects";
import { review } from "../../services/terraforms";
import { setReviewReady } from "../../store/loadingSlice";
import { useDispatch } from "react-redux";
import MermaidChart from "../../components/Mermaid/mermaid";

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
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const chartCode: string = `
  architecture-beta
    group api(cloud)[API]

    service db(database)[Database] in api
    service disk1(disk)[Storage] in api
    service disk2(disk)[Storage] in api
    service server(server)[Server] in api

    db:L -- R:server
    disk1:T -- B:server
    disk2:T -- B:db
`;
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

    setFinishData([]);
    fetchProjectData();
  }, [pid, navigate]);

  useEffect(() => {
    if (!loading && !project) {
      navigate("/profile");
    }
  }, [loading, project, navigate]);

  const handleFinish = async () => {
    const cid = project?.CID || 0;
    try {
      dispatch(setReviewReady(false));
      review(cid, Number(pid), token).then(() => {
        dispatch(setReviewReady(true));
      });
      navigate(`/review/${cid}`, { state: { isReviewReady: false } });
    } catch (error) {
      console.error("review API 호출 실패:", error);
      alert(
        "Terraform 상태 업데이트에 실패했습니다. 네트워크 연결을 확인하거나, 잠시 후 다시 시도해 주세요."
      );
      navigate(`/home/${pid}`);
    }
  };

  const handleFinishData = (data: string[]) => {
    setFinishData(data);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home">
      {/* 슬라이드바 삭제 */}
      {/* <SideBar isOpen={isOpen} setIsOpen={setIsOpen} /> */}
      <Chat projectCID={project!.CID} onFinishData={handleFinishData} />
      <div className="vertical-line"></div>
      <div className="right-side">
        <div className="project-name-container">
          <h1 className="project-name">Project: {project!.projectName}</h1>
        </div>
        <MermaidChart chartCode={chartCode}></MermaidChart>
        {/* <ReactFlowProvider>
          <Board parsedData={parsedData} finishData={finishData} />
        </ReactFlowProvider> */}
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
