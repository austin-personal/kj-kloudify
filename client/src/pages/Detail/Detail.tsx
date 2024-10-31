import React, { useState, useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Board from "../../components/Board/Board";
import DonutChart from "../../components/DetailPage/DonutChart";
import { projectOneInfo } from "../../services/projects";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud } from "@fortawesome/free-solid-svg-icons";
import "./Detail.css";
import { open } from "../../services/conversations";
import { useTemplates } from "../../components/Chat/TemplateProvider";

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
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "bot" | "user";
}

const Detail: React.FC = () => {
  const templates = useTemplates();
  const { pid } = useParams<{ pid: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (pid) {
          const response = await projectOneInfo(Number(pid), token);
          const projectData = response.data;
          setProject(projectData);

          // Chat history를 불러올 때 CID를 사용
          if (projectData.CID && isChatting) {
            openChatHistory(projectData.CID).then(() => {
              setIsLoading(false)
            });
          }
        }
      } catch (error) {
        console.error("프로젝트 정보를 가져오는 중 오류 발생:", error);
      }
    };

    const openChatHistory = async (cid: number) => {
      try {
        const response = await open(cid, token);
        const formattedChat = response.flatMap((msg: any) => {
          // userMessage에서 첫 번째 '-' 이후의 부분만 가져오기
          const parsedUserMessage = msg.userMessage.includes("-")
            ? msg.userMessage.slice(msg.userMessage.indexOf("-") + 1).trim()
            : msg.userMessage;

          // botResponse에서 '!!'나 '**' 앞의 부분을 가져오기
          let parsedBotResponse = msg.botResponse.includes("!!")
            ? msg.botResponse.split("!!")[0].trim()
            : msg.botResponse;

          if (parsedBotResponse.includes("**")) {
            parsedBotResponse = parsedBotResponse.split("**")[0].trim();
          }

          // templates에서 botResponse가 존재하는지 확인하고 매칭되는 텍스트 사용
          const matchingTemplate = Object.values(templates).find(
            (template) => template.name === parsedBotResponse
          );

          const botText = matchingTemplate ? matchingTemplate.text : parsedBotResponse;

          return [
            {
              id: uuidv4(),
              text: parsedUserMessage,
              sender: "user",
            },
            {
              id: uuidv4(),
              text: botText,
              sender: "bot",
            },
          ];
        });
        setChatHistory(formattedChat);
      } catch (error) {
        console.error("채팅 내역을 가져오는 중 오류 발생:", error);
      }
    };

    fetchProjectData();
  }, [pid, token, isChatting]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="detail-page">
      <div className="project-header">
        <p className="project-name-title-th">
          Project Name : <span className="project-name-th">{project.projectName}</span>
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
            className={`previous-chat-explanation-th  ${isChatting ? "hide" : "visible"}`}
          >
            Previous chat
          </div>
        </div>
        <div className="left-content">
          <div className={`previous-chatting-th ${isChatting ? "open" : "close"}`}>
            {isLoading ? (
              <div className="loading-indicator">
                <div className="spinner"></div> {/* 로딩 스피너 */}
                <p>Loading chat history...</p>
              </div>
            ) : (
              <div className="chat-history">
                {chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-message ${message.sender === "bot" ? "bot-message" : "user-message"}`}
                  >
                    <span>{message.text}</span>
                  </div>
                ))}
              </div>
            )}
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
          {/* 스크린샷 들어갈 예정 */}
        </div>
      </div>
    </div>
  );
};

export default Detail;
