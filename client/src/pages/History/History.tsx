import React, { useState, useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useParams } from "react-router-dom";
import Board from "../../components/Board/Board";
import DonutChart from "../../components/HistoryPage/DonutChart";
import { projectOneInfo } from "../../services/projects";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud } from "@fortawesome/free-solid-svg-icons";
import "./History.css";

// 프로젝트 타입 정의
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

const History: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (pid) {
          const response = await projectOneInfo(Number(pid), token);
          setProject(response.data);
        }
      } catch (error) {
        console.error("프로젝트 정보를 가져오는 중 오류 발생:", error);
      }
    };

    fetchProjectData();
  }, [pid, token]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="history-page">
      <div className="project-header">
        <p className="project-name-title-th">
          Project Name :{" "}
          <span className="project-name-th">{project.projectName}</span>
        </p>
      </div>

      <div className="main-content">
        <div className="previous-chat">
          <button
            className="chat-button"
            onClick={() => setIsChatting(!isChatting)}
          >
            <FontAwesomeIcon className="bot-icon" icon={faCloud} />
          </button>
          <div
            className={`previous-chat-explanation-th  ${
              isChatting ? "hide" : "visible"
            }`}
          >
            Previous chat
          </div>
        </div>
        <div className="left-content">
          <div
            className={`previous-chatting-th ${isChatting ? "open" : "close"}`}
          >
            <p>Previous Chat</p>
            {project.previousChats?.map((chat, index) => (
              <div key={index}>{chat}</div>
            ))}
          </div>
          <div className="service-status-th">
            <h3>Service Status</h3>
            <DonutChart slices={[25, 35, 40]} />
            {project.services?.map((service) => (
              <div key={service.id} className={`service ${service.status}`}>
                {service.name}: {service.status}
              </div>
            ))}
          </div>
        </div>
        <div className="architecture-box">
          {/* <ReactFlowProvider>
            <Board
              height="100%"
              borderRadius="20px 20px 20px 20px"
              parsedData={[]}
              nodes={nodes}
              setNodes={setNodes}
            />
          </ReactFlowProvider> */}
        </div>
      </div>
    </div>
  );
};

export default History;
