import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  deleteProject,
  mermaid,
  projectOneInfo,
} from "../../services/projects";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud } from "@fortawesome/free-solid-svg-icons";
import "./Detail.css";
import { Icon } from "@iconify/react";
import { open } from "../../services/conversations";
import { useTemplates } from "../../components/Chat/TemplateProvider";
import { destroy, download, state, terraInfo } from "../../services/terraforms";
import MermaidChart from "../../components/Mermaid/mermaid";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import Lottie from "lottie-react";
import Loadinganimation from "./LoadingService.json";
import Deleteanimation from "./LoadingDestroy.json";
import Runninganimation from "./Running.json"
import StopSign from "./Stopped.svg"
import CodeBlock from "../../components/CodeBlock/CodeBlock";
import CodeBlockLoading from "../../components/CodeBlock/CodeBlockLoading";
import { extractServiceStateName } from "../../utils/awsServices";

const domtoimage = require("dom-to-image");

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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(true);
  const [isStateLoading, setIsStateLoading] = useState(true);
  const [stateData, setStateData] = useState<{ [key: string]: any }>({});
  const [modalType, setModalType] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTerraformVisible, setIsTerraformVisible] = useState(false);
  const [terraData, setTerraData] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [mermaidData, setMermaidData] = useState<string[]>([]); // Mermaid 데이터 상태 추가
  const mermaidRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const getImagePath = (name: string) => {
    try {
      const serviceName = extractServiceStateName(name);
      if (!serviceName) {
        return "https://icon.icepanel.io/AWS/svg/Compute/EC2.svg"; // 기본 이미지 경로 설정
      }
      return require(`../../img/aws-icons/${serviceName}.svg`);
    } catch (error) {
    }
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev); // 슬라이드 상태를 반전
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchProjectData = async () => {
      try {
        if (pid) {
          const response = await projectOneInfo(Number(pid), token);
          const projectData = response.data;
          setProject(projectData);

          if (projectData.PID) {
            const data = await mermaid(projectData.PID, token);
            setMermaidData([data]);
          }

          // 채팅 내역을 처음에 불러옵니다.
          if (projectData.CID) {
            openChatHistory(projectData.CID).then(() => {
              setIsLoading(false);
            });
            const data = await terraInfo(projectData.CID, token); // terraInfo 요청
            setTerraData(data); // 가져온 데이터를 상태에 저장
          }

          setIsStateLoading(true);
          const stateTemp = await state(projectData.CID, token, { signal });
          setStateData(stateTemp || {});
          setIsStateLoading(false);
        }
      } catch (error) {
        setStateData({});
        setIsStateLoading(false);
        setIsLoading(false);
      }
    };

    const openChatHistory = async (cid: number) => {
      try {
        const response = await open(cid, token);
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
                text: finalParsedMessage,
                sender: "user",
              },
              {
                id: uuidv4(),
                text: botText,
                sender: "bot",
              },
            ];
          });
          setChatHistory([...defaultBotMessage, ...formattedChat]);
        }
      } catch (error) {
      }
    };

    fetchProjectData();

    return () => {
      controller.abort(); // 컴포넌트 언마운트 시 요청 취소
    };
  }, [pid, token]);

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
      setShowDeleteModal(false);
      setIsDeleting(true);
      if (modalType === "deleteProject") {
        // 프로젝트 삭제 로직
        await destroy(project.CID, token);
        await deleteProject(project.PID, token);
        setShowDeleteModal(false);
      }
      navigate("/profile");
    } catch (error) {
      setModalType("error"); // 모달 타입 설정
    }
    setIsDeleting(false);
  };

  const handleCheckboxChange = () => {
    setIsTerraformVisible(!isTerraformVisible); // 상태 토글
  };

  const handleScreenshot = async () => {
    if (mermaidRef.current) {
      // div 요소를 PNG 이미지로 변환
      domtoimage
        .toPng(mermaidRef.current)
        .then((dataUrl: string) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "capture.png";
          link.click();
        })
        .catch((error: any) => {
        });
    }
  };

  const handleDownload = async () => {
    try {
      const data = await download(project.CID, token);
      const blob = new Blob([data], { type: "text/plain" });
      const fileURL = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `terraform_code_${project.CID}.tf`;
      link.click();

      URL.revokeObjectURL(fileURL);
    } catch (error) {
    }
  };

  return (
    <div className="detail-page">
      <div className="project-header">
        <div className="project-name-container-detail">
          <div className="project-name-label">Project</div>
          <div className="home-project-name">{project.projectName}</div>
        </div>
        <button
          className="deleteButton-detail"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(project);
          }}
        >
          <FontAwesomeIcon icon={faTrashCan} size="3x" className="svg" />
        </button>
      </div>

      <div className="main-content">
        <div className="left-content">
          <div className="service-status-th">
            <div className="service-header-th">주요 서비스 상태</div>
            {isStateLoading ? (
              // 로딩 중일 때 로딩 애니메이션 표시
              <Lottie
                animationData={Loadinganimation}
                style={{ width: "200px", height: "200px" }}
              />
            ) : stateData && Object.entries(stateData).length > 0 ? (
              <div className="service-status-list">
                {Object.entries(stateData).map(([key, value]) => {
                  const isRunning = value.isRunning;
                  const statusText = isRunning ? "On" : "Off";
                  const statusClass = isRunning ? "running" : "stopped";

                  return (
                    <div
                      key={key}
                      className={`service-status ${statusClass}`}
                    >
                      {/* 이미지 여기 띄워놓음 */}
                      <img className="detail-service-icon-th" src={getImagePath(value.resourceType)} />
                      <div className="hover-text">{value.resourceType}</div>
                      <div className="status-text">{statusText}</div>
                      {isRunning ? (
                        <span><Lottie animationData={Runninganimation} style={{ width: "80px" }}></Lottie></span>
                      ) : (
                        <img className="service-stopped-th" src={StopSign} alt="Stop Sign" width="35" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>데이터가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="architecture-box">
          <div className="previous-chat">
            <button className="chat-button" onClick={toggleChat}>
              <svg className="svgIcon" viewBox="0 0 384 512">
                <FontAwesomeIcon className="bot-icon" icon={faCloud} />
              </svg>
              <p className="detail-chat-btn-text-th">Chat</p>
            </button>
          </div>

          {isChatOpen ? (
            <div className="previous-chatting-th">
              {isLoading ? (
                <div className="detail-loading-chat">
                  <Lottie
                    animationData={Loadinganimation}
                    style={{ width: "200px", height: "200px" }}
                  />
                </div>
              ) : (
                <div className="chat-history">
                  {chatHistory.map((message) => (
                    <>
                      {message.sender === "bot" && (
                        <FontAwesomeIcon className="bot-icon" icon={faCloud} />
                      )}
                      <div
                        key={message.id}
                        className={`chat-message ${message.sender === "bot"
                          ? "bot-message"
                          : "user-message"
                          }`}
                      >
                        <span>{message.text}</span>
                      </div>
                    </>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="container">
                <input
                  type="checkbox"
                  className="checkbox"
                  id="checkbox"
                  onChange={handleCheckboxChange}
                />
                <label className="switch" htmlFor="checkbox">
                  <span className="slider">
                    <Icon
                      icon={
                        isTerraformVisible ? "jam:sitemap" : "mdi:code-braces"
                      }
                      width="27"
                      color="#312D26"
                    />
                  </span>
                </label>
                <span className="notice-tooltip">
                  {isTerraformVisible ? "Architecture Image" : "Terraform Code"}
                </span>
              </div>
              <div className="download">
                {terraData ? (
                  <button
                    className={`download-button ${isTerraformVisible ? "terraform-btn" : "default-btn"
                      }`}
                    onClick={
                      isTerraformVisible ? handleDownload : handleScreenshot
                    }
                  >
                    <svg
                      className="svgIcon"
                      viewBox="0 0 384 512"
                      height="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
                    </svg>
                    <span className="icon2"></span>
                    <span className="download-tooltip">
                      {isTerraformVisible
                        ? "Terratorm Download"
                        : "Image Download"}
                    </span>
                  </button>
                ) : (
                  <button
                    className={`download-button loading ${isTerraformVisible ? "terraform-btn" : "default-btn"
                      }`}
                    disabled
                  >
                    <div className="spinner"></div>

                    <div className="tooltip">
                      환경 설정중입니다. 기다려 주세요.
                    </div>
                  </button>
                )}
              </div>
              {isTerraformVisible ? (
                <div className="terraform-code-th">
                  <div className="terraform-frame-th">
                    <div className="terraform-container-th">
                      {terraData ? (
                        <CodeBlock code={terraData} className="code" />
                      ) : (
                        <CodeBlockLoading />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div ref={mermaidRef} className="mermaid-chart-th">
                  <MermaidChart chartCode={mermaidData} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            {modalType === "deleteProject" && (
              <>
                <h3>경고: 모든 AWS 리소스 종료 작업</h3>
                <p>
                  이 버튼을 클릭하면 현재 계정 내 모든 AWS 서비스와 리소스가
                  영구적으로 종료됩니다.
                </p>
                <p>
                  이로 인해 서비스 중단, 데이터 손실, 복구 불가능한 결과가
                  발생할 수 있습니다.
                </p>
                <p>이 작업을 수행하시겠습니까?</p>
                <h4>⚠️ 한 번 더 확인해주세요. 이 작업은 취소할 수 없습니다.</h4>
              </>
            )}
            {modalType === "error" && (
              <>
                <p>요청하신 작업 중 오류가 발생했습니다.</p>
                <p>잠시 뒤 다시 시도해주세요.</p>
              </>
            )}
            <div className="delete-modal-buttons">
              {modalType === "deleteProject" && (
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
              )}
              {modalType === "error" && (
                <>
                  <button
                    className="delete-cancel-button-th"
                    onClick={handleCancelDelete}
                  >
                    확인
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 삭제 작업 중일 때 오버레이 표시 */}
      {isDeleting && (
        <div className="profile-loading-th">
          <Lottie
            animationData={Deleteanimation}
            style={{ width: "300px", height: "300px" }}
          />
          <h3>삭제중입니다...</h3>
        </div>
      )}
    </div>
  );
};

export default Detail;
