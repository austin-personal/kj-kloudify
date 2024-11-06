import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import DonutChart from "../../components/DetailPage/DonutChart";
import { deleteProject, mermaid, projectOneInfo } from "../../services/projects";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud } from "@fortawesome/free-solid-svg-icons";
import "./Detail.css";
import { open } from "../../services/conversations";
import { useTemplates } from "../../components/Chat/TemplateProvider";
import { destroy, state } from "../../services/terraforms";
import MermaidChart from "../../components/Mermaid/mermaid";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import Lottie from "lottie-react";
import Loadinganimation from "./LoadingService.json"

interface Project {
  PID: number;
  CID: number;
  UID: number;
  ARCTID: number;
  projectName: string;
  createdDate: string;
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
    subtext: "자유롭게 당신의 서비스를 설명해주세요.",
  },
];

const Detail: React.FC = () => {
  const templates = useTemplates();
  const { pid } = useParams<{ pid: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(true);
  const [isStateLoading, setIsStateLoading] = useState(true);
  const [mermaidCode, setMermaidCode] = useState<string[]>([]);
  const [stateData, setStateData] = useState<{ [key: string]: any }>({});
  const [modalType, setModalType] = useState<string>(""); // 모달 타입을 구분하는 상태
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProjectData = async () => {
      try {
        if (pid) {
          if (!project) {
            const response = await projectOneInfo(Number(pid), token);
            const projectData = response.data;
            setProject(projectData);
            const mermaidTemp = await mermaid(Number(pid), token);
            setMermaidCode([mermaidTemp]);

            setIsStateLoading(true);
            const stateTemp = await state(projectData.CID, token, { signal });
            setStateData(stateTemp);
            setIsStateLoading(false);
          }
          // Chat history를 불러올 때 CID를 사용
          if (project?.CID && isChatting && isLoading) {
            openChatHistory(project.CID).then(() => {
              setIsLoading(false);
            });
          }

        }
      } catch (error: any) {
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
              ? msg.userMessage
                .slice(msg.userMessage.lastIndexOf("-") + 1)
                .trim()
              : msg.userMessage;

            // '/'가 포함되어 있다면 '/' 앞에 있는 부분만 가져오기
            const finalParsedMessage = parsedUserMessage.includes("/")
              ? parsedUserMessage
                .slice(0, parsedUserMessage.indexOf("/"))
                .trim()
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

            const botText = matchingTemplate
              ? matchingTemplate.text
              : parsedBotResponse;

            if (triggerMessage) {
              return [
                {
                  id: uuidv4(),
                  text: botText,
                  sender: "bot",
                },
              ];
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
      } catch (error) { }
    };

    fetchProjectData();

    return () => {
      controller.abort(); // 컴포넌트 언마운트 시 요청 취소
    };
  }, [pid, token, isChatting]);

  if (!project) return <div>Loading...</div>;

  const handleDeleteClick = (project: Project) => {
    setModalType("deleteProject"); // 모달 타입 설정
    setShowDeleteModal(true); // 모달 띄우기
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    try {
      if (modalType === "deleteProject") {
        // 프로젝트 삭제 로직
        await destroy(project.CID, token);
        await deleteProject(project.PID, token);
        setShowDeleteModal(false);
      }
      navigate("/profile")
    } catch (error) {
      setModalType("error"); // 모달 타입 설정
    }
  };

  return (
    <div className="detail-page">
      <div className="project-header">
        <p className="project-name-title-th">
          Project Name :{" "}
          <span className="project-name-th">{project.projectName}</span>
        </p>
        <button
          className="deleteButton"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(project);
          }}
        >
          <FontAwesomeIcon
            icon={faTrashCan}
            size="xl"
            className="svg"
          />
        </button>
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
            className={`previous-chat-explanation-th  ${isChatting ? "hide" : "visible"
              }`}
          >
            Previous chat
          </div>
        </div>
        <div className="left-content">
          <div
            className={`previous-chatting-th ${isChatting ? "open" : "close"}`}
          >
            {isLoading ? (
              <div className="detail-loading-chat">
                <Lottie animationData={Loadinganimation} style={{ width: "200px", height: "200px" }} />
              </div>
            ) : (
              <div className="chat-history">
                {chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-message ${message.sender === "bot" ? "bot-message" : "user-message"
                      }`}
                  >
                    <span>{message.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="service-status-th">
            <h3>Service Status</h3>
            {isStateLoading ? ( // 로딩 중일 때 스피너 표시
              <Lottie animationData={Loadinganimation} style={{ width: "200px", height: "200px" }} />
            ) : (
              <div className="service-status-list">
                {Object.entries(stateData).map(([key, value]) => (
                  <div key={key} className="service-status-item">
                    {value.resourceType} : {value.isRunning ? "Running" : "Stopped"}
                  </div>
                ))}
              </div>
            )}
            {/* <DonutChart slices={[25, 35, 40]} /> */}
          </div>
        </div>
        <div className="architecture-box">
          <MermaidChart chartCode={mermaidCode}></MermaidChart>
        </div>
      </div>
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            {modalType === "deleteProject" &&
              <>
                <h3>경고: 모든 AWS 리소스 종료 작업</h3>
                <p>이 버튼을 클릭하면 현재 계정 내 모든 AWS 서비스와 리소스가 영구적으로 종료됩니다.</p>
                <p>이로 인해 서비스 중단, 데이터 손실, 복구 불가능한 결과가 발생할 수 있습니다.</p>
                <p>이 작업을 수행하시겠습니까?</p>
                <h4>⚠️ 한 번 더 확인해주세요. 이 작업은 취소할 수 없습니다.</h4>
              </>
            }
            {modalType === "error" &&
              <>
                <p>요청하신 작업 중 오류가 발생했습니다.</p>
                <p>잠시뒤 다시 시작해주세요.</p>
              </>
            }
            <div className="delete-modal-buttons">
              {modalType === "deleteProject" &&
                <>
                  <button
                    className="delete-cancel-button-th"
                    onClick={handleCancelDelete}
                  >
                    취소
                  </button>
                  <button
                    className="delete-confirm-button-th"
                    onClick={handleConfirmDelete}
                  >
                    삭제
                  </button>
                </>
              }
              {modalType === "error" &&
                <>
                  <button
                    className="delete-cancel-button-th"
                    onClick={handleCancelDelete}
                  >
                    확인
                  </button>
                </>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;
