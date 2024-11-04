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
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setFinishData, clearFinishData } from "../../store/finishDataSlice";
import { setHasSecret } from "../../store/loadingSlice";
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

const Home: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const finishData = useAppSelector((state) => state.finishData.finishData);
  const token = localStorage.getItem("token");
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  console.log("finished:", finishData);
  //home 페이지면 무조건 키가 있어야 함.
  dispatch(setHasSecret(true));

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

    dispatch(clearFinishData());
    fetchProjectData();
  }, [pid, navigate, dispatch]);

  useEffect(() => {
    if (!loading && !project) {
      navigate("/profile");
    }
  }, [loading, project, navigate]);

  const handleFinish = async () => {
    const cid = project?.CID || 0;
    try {
      dispatch(setReviewReady(false));
      review(cid, Number(pid), token).then(({ message, bool }) => {
        dispatch(setReviewReady(true));
        if (!bool) {
          alert(message);
          navigate(`/home/${pid}`);
        }
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
    dispatch(setFinishData(data));
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
        <MermaidChart chartCode={finishData}></MermaidChart>
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
