import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Board from "../../components/Board/Board";
import { projectOneInfo } from "../../services/projects";
import "./History.css";

// 프로젝트 타입 정의
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
            previous chat
          </button>
          <div className="previous-chat-explanation-th">Previous chat</div>
        </div>
        <div className="left-content">
          <div
            className={`previous-chatting-th ${isChatting ? "open" : "close"}`}
          >
            <h3>Previous Chat</h3>
            {project.previousChats?.map((chat, index) => (
              <div key={index}>{chat}</div>
            ))}
          </div>
          <div className="service-status-th">
            <h3>Service Status</h3>
            {project.services?.map((service) => (
              <div key={service.id} className={`service ${service.status}`}>
                {service.name}: {service.status}
              </div>
            ))}
          </div>
        </div>
        <div className="architecture-box">
          <h3>Architecture</h3>
          <Board
            height="400px"
            borderRadius="20px 20px 20px 20px"
            parsedData={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default History;
