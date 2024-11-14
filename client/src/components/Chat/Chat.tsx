import React, { useState, useEffect, useRef } from "react";
import { ask, open } from "../../services/conversations";
import "./Chat.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import {
  faCircleDown,
  faCloud,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid"; // UUID 가져오기
import { Template, useTemplates } from "./TemplateProvider";
import { activate, deactivate } from "../../store/btnSlice";
import { useAppDispatch } from "../../store/hooks";
import { clearFinishData, setFinishData } from "../../store/finishDataSlice";
import ReactMarkdown from 'react-markdown';

interface ChatProps {
  projectCID: number;
}

interface Message {
  element?: JSX.Element; // 추가
  id: string;
  header?: string;
  text?: string;
  multiselect?: string;
  subtext?: string;
  sender: "user" | "bot";
  buttons?: { id: number; label: string }[];
  nobutton?: { id: number; label: string };
  checks?: { id: number; label: string }[];
  nocheck?: { id: number; label: string };
  servicechecks?: { id: number; label: string }[];
}

const defaultBotMessage: Message[] = [
  {
    id: uuidv4(),
    text: "Kloudify와 쉽게 클라우드 아키텍쳐를 설계 해봐요!\n 우측 상단에 Kloudify와 대화하는 팁을 참고 하여 대화해 보세요.",
    sender: "bot",
  },
  {
    id: uuidv4(),
    header: "구조 설정",
    text: "먼저, 당신의 웹서비스에 대해 알고 싶어요.\n 당신의 웹 서비스의 주요 목적과 기능은 무엇인가요?",
    sender: "bot",
    subtext: "자유롭게 당신의 서비스를 설명해주세요.",
  },
];

const Chat: React.FC<ChatProps> = ({ projectCID }) => {
  const templates = useTemplates();
  const targetTemplateNames = ["서버", "데이터베이스", "스토리지", "추가적인 네트워크 설정"];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectedChecks, setSelectedChecks] = useState<{
    [key: string]: string[];
  }>({});

  const dispatch = useAppDispatch();

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto"; // 높이를 초기화
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // 내용에 맞게 높이 설정

      // 입력이 비어 있으면 최소 높이로 돌아가도록 설정
      if (e.target.value === "") {
        textAreaRef.current.style.height = "40px";
      }
    }
  };

  // 대화 로딩
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        dispatch(deactivate());
        dispatch(clearFinishData());
        const initialMessages = await open(projectCID);
        setMessages(defaultBotMessage);
        if (initialMessages && initialMessages.length > 0) {
          let temp = -2;
          const formattedMessages: Message[] = initialMessages.flatMap(
            (msg: any, index: number) => {
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

              const matchingTemplate = Object.values(templates).find(
                (template) => template.name === parsedBotResponse
              );

              // 만약 template6-1이 존재하면 review활성화, user chat만 보이게
              if (parsedBotResponse === "template6-1") {
                dispatch(activate());
                temp = index;
                return [
                  {
                    id: uuidv4(),
                    text: finalParsedMessage,
                    sender: "user",
                  },
                ];
              }

              // 마지막 메시지인지 확인
              const isLastMessage = index === initialMessages.length - 1;
              // template6-1 다음 메시지인지 확인
              const triggerMessage = index === temp + 1;

              // 공통 Bot 메시지 생성 함수
              const createBotMessage = (
                template: any,
                responseText: string
              ) => ({
                id: uuidv4(),
                sender: "bot",
                header: template?.header,
                text: template ? template.text : responseText,
                multiselect: template?.multiselect,
                subtext: template?.subtext,
                checks: isLastMessage ? template?.checks : undefined,
                buttons: isLastMessage ? template?.buttons : undefined,
                nobutton: isLastMessage ? template?.nobutton : undefined,
                nocheck: isLastMessage ? template?.nocheck : undefined,
                servicechecks: isLastMessage
                  ? template?.servicechecks
                  : undefined,
              });

              // triggerMessage일 때는 bot 메시지만 반환
              if (triggerMessage) {
                return [createBotMessage(matchingTemplate, parsedBotResponse)];
              }

              // 일반 메시지 형식 반환
              return [
                {
                  id: uuidv4(),
                  text: finalParsedMessage,
                  sender: "user",
                },
                createBotMessage(matchingTemplate, parsedBotResponse),
              ];
            }
          );
          setMessages((prevMessages) => [
            ...prevMessages,
            ...formattedMessages,
          ]);

          // 마지막 botResponse에서 "**" 뒤의 부분을 파싱하여 onParsedData로 전달
          const lastBotResponse =
            initialMessages[initialMessages.length - 1].botResponse;

          if (lastBotResponse.includes("```")) {
            // "```"로 감싸진 부분을 추출
            const codeBlock = lastBotResponse.match(/```mermaid([\s\S]*?)```/);
            if (codeBlock && codeBlock[1]) {
              // "```"로 감싸진 내용이 존재하면 `finishData`로 전달
              dispatch(setFinishData([codeBlock[1].trim()]));
            }
          } else if (lastBotResponse.includes("**")) {
            // "```"로 감싸진 부분이 없고 "**"가 있으면 기존 방식으로 파싱
            let afterAsterisks = lastBotResponse.split("**")[1].trim();
            if (afterAsterisks.includes("**")) {
              afterAsterisks = afterAsterisks.split("**")[0].trim();
            }
            dispatch(setFinishData([afterAsterisks]));
          }
        }
      } catch (error) {
        setMessages(defaultBotMessage);
      }
    };

    fetchMessages();
  }, [projectCID]);

  // 메시지 추가 후 자동으로 스크롤을 아래로 이동시키는 함수
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth", // 부드러운 스크롤을 위한 옵션
      });
    }
  };

  // 스크롤 이벤트 감지 함수
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // 스크롤이 맨 아래에 있지 않으면 버튼을 보이게 함
      if (scrollTop + clientHeight < scrollHeight - 10) {
        setShowScrollButton(true); // 버튼 표시
      } else {
        setShowScrollButton(false); // 버튼 숨김
      }
    }
  };

  // messages 배열이 변경될 때마다 스크롤을 아래로 이동하고, 이전 봇 메시지의 버튼을 제거
  useEffect(() => {
    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.map((message, index) => {
        // 마지막 메시지를 제외한 봇 메시지에서만 buttons를 undefined로 설정
        if (
          index !== prevMessages.length - 1 &&
          message.sender === "bot" &&
          message.buttons
        ) {
          return { ...message, buttons: undefined, nobutton: undefined };
        }
        return message;
      });

      // 만약 업데이트가 필요하지 않다면 원래 배열을 반환하여 상태 변화를 방지
      if (JSON.stringify(updatedMessages) === JSON.stringify(prevMessages)) {
        return prevMessages;
      }

      return updatedMessages;
    });

    // 스크롤을 아래로 이동
    scrollToBottom();
  }, [messages]);

  // 스크롤 이벤트 추가
  useEffect(() => {
    if (scrollRef.current) {
      const currentRef = scrollRef.current;
      currentRef.addEventListener("scroll", handleScroll);

      // cleanup 함수로 이벤트 리스너 제거
      return () => {
        currentRef.removeEventListener("scroll", handleScroll);
      };
    }
  }, [scrollRef.current]); // scrollRef.current가 변경될 때만 실행

  // 체크박스 클릭 핸들러
  const handleCheckChange = (
    messageId: string,
    label: string,
    isNoCheck?: boolean
  ) => {
    setSelectedChecks((prevState) => {
      // 만약 noCheck를 클릭했다면 그대로 return
      if (isNoCheck) {
        return {
          ...prevState,
          [messageId]: [label],
        };
      } else {
        const currentChecks = prevState[messageId] || [];
        // "알아서 해줘"를 클릭했다면 "알아서 해줘"만 return
        if (currentChecks.includes("알아서 해줘")) {
          const filteredChecks = currentChecks.filter(
            (item) => item !== "알아서 해줘"
          );
          return {
            ...prevState,
            [messageId]: [...filteredChecks, label],
          };
        }
        // 체크한걸 또 체크했다면 체크에서 빼기
        if (currentChecks.includes(label)) {
          return {
            ...prevState,
            [messageId]: currentChecks.filter((item) => item !== label),
          };
          // 그게 아니라면 제대로 체크
        } else {
          return {
            ...prevState,
            [messageId]: [...currentChecks, label],
          };
        }
      }
    });
  };

  // 체크박스 제출 핸들러
  const handleCheckSubmit = (messageId: string) => {
    const selectedLabels = selectedChecks[messageId] || [];
    const message = messages.find((msg) => msg.id === messageId);

    if (message?.servicechecks) {
      // servicechecks가 있는 경우 targetTemplateNames 확인
      const uncheckedLabels = targetTemplateNames.filter(
        (name) => !selectedLabels.includes(name)
      );

      // 선택한거랑 선택안한거 둘 다 BackEnd한테 보내기
      if (selectedLabels.length > 0) {
        handleButtonClick(messageId, {
          id: 0,
          label: `${selectedLabels.join(", ")} 선택 / ${uncheckedLabels.join(
            ", "
          )} 선택안함`,
        });
      } else {
        // 선택된 항목이 없는 경우에도 선택되지 않은 항목을 포함해 메시지를 보냄
        handleButtonClick(messageId, {
          id: 0,
          label: `선택되지 않음 / ${uncheckedLabels.join(", ")} 선택안함`,
        });
      }
    } else {
      // 기존 checks는 기존 방식대로 처리
      if (selectedLabels.length > 0) {
        handleButtonClick(messageId, {
          id: 0,
          label: `${selectedLabels.join(", ")}`,
        });
      }
    }
  };

  // 새로운 메시지를 생성하고 메시지 배열에 추가하는 함수
  const createAndAddMessage = (template?: Template, text?: string) => {
    const newMessage: Message = template
      ? {
        header: template.header,
        id: uuidv4(),
        text: template.text,
        subtext: template.subtext,
        multiselect: template.multiselect,
        sender: "bot",
        buttons: template.buttons,
        nobutton: template.nobutton,
        checks: template.checks,
        nocheck: template.nocheck,
        servicechecks: template.servicechecks,
      }
      : {
        id: uuidv4(),
        text: text || "",
        sender: "bot",
      };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // 응답 메시지를 처리하는 함수
  const processResponseMessage = (responseMessage: string) => {
    // "```"로 감싸진 부분이 있는지 먼저 확인
    const codeBlock = responseMessage.match(/```([\s\S]*?)```/);

    if (codeBlock && codeBlock[1]) {
      // "```"로 감싸진 부분이 있을 경우 처리
      const [beforeCodeBlock] = responseMessage.split("```").map((part) => part.trim());
      const afterCodeBlock = codeBlock[1].trim();

      // afterCodeBlock 데이터를 배열 형태로 설정
      dispatch(setFinishData([afterCodeBlock]));

      // beforeCodeBlock이 템플릿 이름과 매치하는지 찾기
      const matchingTemplate = Object.values(templates).find(
        (template) => template.name === beforeCodeBlock
      );

      // 일치하는 템플릿이 있으면 템플릿 메시지를 추가하고, 없으면 일반 메시지를 추가
      createAndAddMessage(matchingTemplate, beforeCodeBlock);
    }
    // "```"가 없고 "**"로 감싸진 경우 처리
    else if (responseMessage.includes("**")) {
      let [beforeAsterisks, afterAsterisks] = responseMessage
        .split("**")
        .map((part) => part.trim());

      if (afterAsterisks.includes("**")) {
        afterAsterisks = afterAsterisks.split("**")[0].trim();
      }
      // "**" 뒤에 있는 데이터를 배열 형태로 받기
      dispatch(setFinishData([afterAsterisks]));

      // beforeAsterisks가 템플릿 이름과 매치하는지 찾기
      const matchingTemplate = Object.values(templates).find(
        (template) => template.name === beforeAsterisks
      );

      // 일치하는 템플릿이 있으면 템플릿 메시지를 추가하고, 없으면 일반 메시지를 추가
      createAndAddMessage(matchingTemplate, beforeAsterisks);
    }
    // 별도의 특수 구문이 없는 경우 기존 템플릿 처리
    else {
      const matchingTemplate = Object.values(templates).find(
        (template) => template.name === responseMessage
      );

      createAndAddMessage(matchingTemplate, responseMessage);
    }
  };

  // 메시지 전송 핸들러 (인풋 필드용)
  const handleSendMessage = async (
    event?: React.FormEvent | React.MouseEvent
  ) => {
    event?.preventDefault();
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: uuidv4(),
      text: input,
      sender: "user",
    };
    setMessages([...messages, userMessage]);
    setInput("");

    const loadingMessage: Message = {
      id: uuidv4(),
      element: <div className="loader"></div>,
      sender: "bot",
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    try {
      // 이전 챗봇 메시지 가져오기
      const lastBotMessage = messages
        .slice()
        .reverse()
        .find((msg) => msg.sender === "bot" && typeof msg.text === "string");

      let messageToSend = "";

      if (lastBotMessage) {
        messageToSend = `${lastBotMessage.text} - ${input}`;
      } else {
        messageToSend = input;
      }

      let responseMessage = await ask(messageToSend, projectCID);
      if (responseMessage === "template6-1") {
        responseMessage = await ask("template6-1", projectCID);
        dispatch(activate());
      }

      // 로딩 메시지 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingMessage.id)
      );

      // 응답 메시지 처리
      processResponseMessage(responseMessage);
    } catch (error) {
      // 로딩 메시지 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingMessage.id)
      );

      // 오류 메시지 추가
      const errorMessage: Message = {
        id: uuidv4(),
        text: "죄송합니다. 메시지를 보내는 데 실패했습니다.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      e.nativeEvent.isComposing === false
    ) {
      e.preventDefault(); // 기본 Enter 동작 방지 (줄바꿈 방지)
      handleSendMessage(); // 메시지 전송 함수 호출
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "40px";
      }
    }
  };

  // 버튼 클릭 핸들러
  const handleButtonClick = async (
    messageId: string,
    button: { id: number; label: string }
  ) => {
    // 해당 메시지에서 버튼 제거
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId
          ? { ...msg, buttons: undefined, nobutton: undefined, checks: undefined, servicechecks: undefined }
          : msg
      )
    );

    // 사용자 메시지 추가
    let userMessageText: string;

    userMessageText = button.label;

    let parsedUserMessageText = userMessageText;
    if (userMessageText.includes("/")) {
      parsedUserMessageText = userMessageText.split("/")[0].trim();
    }

    const userMessage: Message = {
      id: uuidv4(),
      text: parsedUserMessageText,
      sender: "user",
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // 로딩 메시지 추가
    const loadingMessage: Message = {
      id: uuidv4(),
      element: <div className="loader"></div>,
      sender: "bot",
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    try {
      // 이전 챗봇 메시지 가져오기
      const lastBotMessage = messages
        .slice()
        .reverse()
        .find((msg) => msg.sender === "bot" && typeof msg.text === "string");

      let messageToSend = "";

      if (lastBotMessage) {
        messageToSend = `${lastBotMessage.text} - ${userMessageText}`;
      } else {
        messageToSend = userMessageText;
      }

      let responseMessage = await ask(messageToSend, projectCID);
      if (responseMessage === "template6-1") {
        responseMessage = await ask("template6-1", projectCID);
        dispatch(activate());
      }

      // 로딩 메시지 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingMessage.id)
      );

      // 응답 메시지 처리
      processResponseMessage(responseMessage);
    } catch (error) {

      // 로딩 메시지 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingMessage.id)
      );

      // 오류 메시지 추가
      const errorMessage: Message = {
        id: uuidv4(),
        text: "죄송합니다. 메시지를 보내는 데 실패했습니다.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleButtonChange = (messageId: string, label: string) => {
    setSelectedChecks((prevState) => ({
      ...prevState,
      [messageId]: [label] // 선택한 체크박스만 활성화하고 다른 모든 체크박스는 해제
    }));
  };

  return (
    <div className="chat-container">
      <div className="notice-text">
        <div className="chat-upper-text-th">
          우측 상단의{" "}
          <FontAwesomeIcon className="space" icon={faCircleQuestion} />에 마우스를
          올리면 가이드를 볼 수 있어요.
        </div>
        <div className="download-button-th">
          <button
            className="faq-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
              <path
                d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
              ></path>
            </svg>
          </button>
          <div className="home-chat-guide-th">
            <ReactMarkdown >
              {` - 팁\n   - 필요한 목적은 정확하게 말해주세요.\n    - 자세할수록 좋아요!\n    - 적극적으로 커스터마이즈 해보세요!\n- 주의 사항\n    - 아직은 AWS 밖에 지원 하지 않아요.\n   - 저희 서비스는 간단한 웹 사이트에 특화 되어있어요.
                `}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <div className="message-list" ref={scrollRef}>
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            {message.sender === "bot" && (
              <FontAwesomeIcon className="bot-icon" icon={faCloud} />
            )}
            <div className={`message ${message.sender}-message`}>


              {/* 헤더가 존재하면 렌더링 */}
              {message.header && (
                <div
                  className={`message-header ${message.header === "서버"
                    ? "server-class"
                    : message.header === "데이터베이스"
                      ? "database-class"
                      : message.header === "스토리지"
                        ? "storage-class"
                        : message.header === "네트워크"
                          ? "network-class"
                          : ""
                    }`}
                >
                  <strong>{message.header}</strong>
                </div>
              )}

              <div className="home-chat-text-th">
                {/* 메세지 존재하면 렌더링 */}
                <div className="message-content">
                  {message.text ? (
                    <>
                      <ReactMarkdown >
                        {message.text}
                      </ReactMarkdown>
                    </>
                  ) : (
                    <div className="loading-text-th">
                      {message.element}
                    </div>
                  )}
                </div>
              </div>

              {/* 체크박스가 존재하면 렌더링 */}
              {message.checks && (
                <div className={`checkbox-container-th ${message.multiselect ? 'multiselect-enabled' : ''}`}>
                  {message.multiselect && <div className="multiselect-badge">다중 선택 가능</div>}
                  {message.nocheck && (
                    <label
                      className="custom-checkbox"
                      key={message.nocheck.label}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedChecks[message.id]?.includes(
                            message.nocheck.label
                          ) || false
                        }
                        onChange={() =>
                          message.nocheck?.label &&
                          handleCheckChange(
                            message.id,
                            message.nocheck?.label,
                            true
                          )
                        }
                      />
                      <svg viewBox="0 0 64 64" height="20px" width="20px">
                        <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" className="path important-path-th"></path>
                      </svg>
                      <div className="important-check-message-th">{message.nocheck.label}</div>
                    </label>
                  )}
                  {message.checks.map((check) => (
                    <label className="custom-checkbox" key={check.label}>
                      <input
                        type="checkbox"
                        checked={selectedChecks[message.id]?.includes(check.label) || false}
                        onChange={() =>
                          handleCheckChange(message.id, check.label)
                        }
                      />
                      <svg viewBox="0 0 64 64" height="20px" width="20px">
                        <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" className="path"></path>
                      </svg>
                      <div className="check-message-th">{check.label}</div>
                    </label>
                  ))}
                </div>
              )}

              {/* 서비스체크박스가 존재하면 렌더링 */}
              {message.servicechecks && (
                <div className={`checkbox-container-th ${message.multiselect ? 'multiselect-enabled' : ''}`}>
                  {message.multiselect && <div className="multiselect-badge">다중 선택 가능</div>}
                  {message.servicechecks.map((check) => (
                    <label className="custom-checkbox" key={check.label}>
                      <input
                        type="checkbox"
                        checked={
                          selectedChecks[message.id]?.includes(check.label) ||
                          false
                        }
                        onChange={() =>
                          handleCheckChange(message.id, check.label)
                        }
                      />
                      <svg viewBox="0 0 64 64" height="20px" width="20px">
                        <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" className="path"></path>
                      </svg>
                      <div className="check-message-th">{check.label}</div>

                    </label>
                  ))}
                </div>
              )}

              {/* 서브텍스트가 존재하면 렌더링 */}
              {message.subtext && (
                <p className="template-sub-th">{message.subtext}</p>
              )}

              {/* 버튼이 존재하면 렌더링 */}
              {message.buttons && (
                <div className="checkbox-container-th">
                  {message.nobutton && (
                    <label
                      className="custom-checkbox"
                      key={message.nobutton.label}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedChecks[message.id]?.includes(
                            message.nobutton.label
                          ) || false
                        }
                        onChange={() =>
                          message.nobutton?.label &&
                          handleCheckChange(
                            message.id,
                            message.nobutton?.label,
                            true
                          )
                        }
                      />
                      <svg viewBox="0 0 64 64" height="20px" width="20px">
                        <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" className="path important-path-th"></path>
                      </svg>
                      <div className="important-check-message-th">{message.nobutton.label}</div>
                    </label>
                  )}
                  {message.buttons.map((button) => (
                    <label className="custom-checkbox" key={button.label}>
                      <input
                        type="checkbox"
                        checked={selectedChecks[message.id]?.includes(button.label) || false}
                        onChange={() =>
                          handleButtonChange(message.id, button.label)
                        }
                      />
                      <svg viewBox="0 0 64 64" height="20px" width="20px">
                        <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" className="path"></path>
                      </svg>
                      <div className="check-message-th">{button.label}</div>
                    </label>
                  ))}
                </div>
              )}

              {/* 체크박스 제출 버튼 */}
              {(message.checks || message.servicechecks || message.buttons) && (
                <button
                  onClick={() => handleCheckSubmit(message.id)}
                  className="template-btn-th"
                >
                  제출
                </button>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="input-container">
        {/* 스크롤을 아래로 이동하는 버튼 */}
        {showScrollButton && (
          <div className="scroll-to-bottom">
            <FontAwesomeIcon
              className="scroll-icon"
              onClick={scrollToBottom}
              icon={faCircleDown}
              size="2xl"
            />
            <div className="scroll-background"></div>
          </div>
        )}
        <form className="chat-form">
          <textarea
            ref={textAreaRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1} // 기본 줄 수
          />
          <button
            type="button"
            className="chat-button-sa"
            onClick={handleSendMessage}
          >
            <FontAwesomeIcon
              icon={faPaperPlane}
              size="2xl"
              className="chat-icon"
            />
          </button>
        </form>
      </div>
    </div>
  );
};

// interface TypingMessageProps {
//   text: string;
//   maxLength: number;
// }

// const TypingMessage: React.FC<TypingMessageProps> = ({ text, maxLength }) => {
//   const [typedText, setTypedText] = useState("");
//   const [typingStopped, setTypingStopped] = useState(false);

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       if (typedText.length < maxLength) {
//         setTypedText(text.slice(0, typedText.length + 1));
//       } else {
//         setTypingStopped(true);
//         setTypedText(text);
//         clearInterval(intervalId);
//       }
//     }, 50);

//     return () => clearInterval(intervalId);
//   }, [typedText, maxLength, text]);

//   return <div>{typingStopped ? <p>{text}</p> : <p>{typedText}|</p>}</div>;
// };

export default Chat;
