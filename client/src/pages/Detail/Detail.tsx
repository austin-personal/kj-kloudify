import React, { useState, useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Board from "../../components/Board/Board";
import DonutChart from "../../components/DetailPage/DonutChart";
import { mermaid, projectOneInfo } from "../../services/projects";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud } from "@fortawesome/free-solid-svg-icons";
import "./Detail.css";
import { open } from "../../services/conversations";
import { useTemplates } from "../../components/Chat/TemplateProvider";
import { state } from "../../services/terraforms";
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
}

interface ChatMessage {
  id: string;
  text: string;
  subtext?: string;
  sender: "bot" | "user";
}

const defaultBotMessage: ChatMessage[] = [
  {
    id: uuidv4(),
    text: "Kloudify와 쉽게 클라우드 아키텍쳐를 설계 해봐요! 우측 상단에 Kloudify와 대화하는 팁을 참고 하여 대화해 보세요.",
    sender: "bot",
  },
  {
    id: uuidv4(),
    text: "먼저, 당신의 웹서비스에 대해 알고 싶어요. 당신의 웹 서비스의 주요 목적과 기능은 무엇인가요?",
    sender: "bot",
    subtext: "자유롭게 당신의 서비스를 설명해주세요."
  }
];

const Detail: React.FC = () => {
  const templates = useTemplates();
  const { pid } = useParams<{ pid: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(true);
  let mermaidtemp: any[] = []
  let ans: string[] = []

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (pid) {
          if (!project) {
            const response = await projectOneInfo(Number(pid), token);
            const projectData = response.data;
            setProject(projectData);
          }
          // Chat history를 불러올 때 CID를 사용
          if (project?.CID && isChatting && isLoading) {
            openChatHistory(project.CID).then(() => {
              setIsLoading(false)
            });
          }
          // const response = await state(project?.UID, project?.CID, token);
          // console.log("이것이 state? : ", response);
          mermaidtemp = await mermaid(Number(pid), token);
          ans = [JSON.stringify(mermaidtemp)]
          console.log(mermaidtemp)
        }
      } catch (error) {
        console.error("프로젝트 정보를 가져오는 중 오류 발생:", error);
      }
    };

    const openChatHistory = async (cid: number) => {
      try {
        const response = await open(cid, token);
        setChatHistory(defaultBotMessage);
        if (response && response.length > 0) {
          let temp = -2;
          const formattedChat = response.flatMap((msg: any, index: number) => {
            // userMessage에서 - 이후의 부분만 가져오기
            const parsedUserMessage = msg.userMessage.includes("-")
              ? msg.userMessage.slice(msg.userMessage.lastIndexOf("-") + 1).trim()
              : msg.userMessage;

            // '/'가 포함되어 있다면 '/' 앞에 있는 부분만 가져오기
            const finalParsedMessage = parsedUserMessage.includes("/")
              ? parsedUserMessage.slice(0, parsedUserMessage.indexOf("/")).trim()
              : parsedUserMessage;

            // botResponse에서 ** 이전의 부분만 가져오기
            const parsedBotResponse = msg.botResponse.includes("**")
              ? msg.botResponse.split("**")[0].trim()
              : msg.botResponse;

            // templates에서 botResponse가 존재하는지 확인하고 매칭되는 텍스트 사용
            const matchingTemplate = Object.values(templates).find(
              (template) => template.name === parsedBotResponse
            );

            // 만약 template6-1이 존재하면 review활성화, user chat만 보이게
            if (parsedBotResponse === "template6-1") {
              temp = index;
              return [
                {
                  id: uuidv4(),
                  text: finalParsedMessage,
                  sender: "user",
                },
              ];
            }
            // template6-1 다음 메시지인지 확인
            const triggerMessage = index === temp + 1;

            const botText = matchingTemplate ? matchingTemplate.text : parsedBotResponse;

            if (triggerMessage) {
              return [
                {
                  id: uuidv4(),
                  text: botText,
                  sender: "bot",
                },
              ]
            }
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
        }
      } catch (error) {
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
          <MermaidChart chartCode={ans}></MermaidChart>
          {/* 스크린샷 들어갈 예정 */}
        </div>
      </div>
    </div>
  );
};

export default Detail;
