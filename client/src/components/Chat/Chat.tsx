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

interface ChatProps {
  projectCID: number;
}

interface Message {
  id: string;
  header?: string;
  text: string | JSX.Element;
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

const Chat: React.FC<ChatProps> = ({ projectCID }) => {
  const templates = useTemplates();
  const targetTemplateNames = [
    "서버",
    "데이터베이스",
    "스토리지",
    "네트워크",
  ];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectedChecks, setSelectedChecks] = useState<{
    [key: string]: string[];
  }>({});
  const [isHovered, setIsHovered] = useState(false);

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
        const token = localStorage.getItem("token") || "";
        dispatch(deactivate())
        dispatch(clearFinishData())
        const initialMessages = await open(projectCID, token);
        setMessages(defaultBotMessage);
        if (initialMessages && initialMessages.length > 0) {
          let temp = -2;
          const formattedMessages: Message[] = initialMessages.flatMap(
            (msg: any, index: number) => {
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
              const createBotMessage = (template: any, responseText: string) => ({
                id: uuidv4(),
                sender: "bot",
                header: template?.header,
                text: template ? template.text : responseText,
                subtext: template?.subtext,
                checks: isLastMessage ? template?.checks : undefined,
                buttons: isLastMessage ? template?.buttons : undefined,
                nobutton: isLastMessage ? template?.nobutton : undefined,
                nocheck: isLastMessage ? template?.nocheck : undefined,
                servicechecks: isLastMessage ? template?.servicechecks : undefined,
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

          if (lastBotResponse.includes("**")) {
            const afterAsterisks = lastBotResponse.split("**")[1].trim();

            let parsedDataArray: string[] = [];

            let dataString = afterAsterisks.replace(/^\[|\]$/g, "");
            parsedDataArray = dataString.split(",").map((item: string) => item.trim());

            dispatch(setFinishData(parsedDataArray));
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
  const handleCheckChange = (messageId: string, label: string, isNoCheck?: boolean) => {
    setSelectedChecks((prevState) => {
      // 만약 noCheck를 클릭했다면 그대로 return
      if (isNoCheck) {
        return {
          ...prevState, [messageId]: [label],
        }
      } else {
        const currentChecks = prevState[messageId] || [];
        // "알아서 해줘"를 클릭했다면 "알아서 해줘"만 return
        if (currentChecks.includes("알아서 해줘")) {
          const filteredChecks = currentChecks.filter((item) => item !== "알아서 해줘")
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
          label: `${selectedLabels.join(", ")} 선택 / ${uncheckedLabels.join(", ")} 선택안함`,
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
    if (responseMessage.includes("**")) {
      const [beforeAsterisks, afterAsterisks] = responseMessage
        .split("**")
        .map((part) => part.trim());

      // "**"뒤에 있는 데이터를 배열형태로 받기
      let parsedDataArray: string[] = [];
      let dataString = afterAsterisks.replace(/^\[|\]$/g, "");
      parsedDataArray = dataString.split(",").map((item) => item.trim());

      dispatch(setFinishData(parsedDataArray));

      // 이제 beforeAsterisks가 템플릿 이름과 매치하는지 찾기
      const matchingTemplate = Object.values(templates).find(
        (template) => template.name === beforeAsterisks
      );

      // 일치하는 템플릿이 있으면 템플릿 메시지를 추가하고, 없으면 일반 메시지를 추가
      createAndAddMessage(matchingTemplate, beforeAsterisks);
    } else {
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
      text: <div className="loader"></div>,
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
      console.log("responseMessage : ", responseMessage)
      if (responseMessage === "template6-1") {
        responseMessage = await ask("template6-1", projectCID);
        dispatch(activate())
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
    if (e.key === "Enter" && !e.shiftKey && e.nativeEvent.isComposing === false) {
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

    let parsedUserMessageText = userMessageText
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
      text: <div className="loader"></div>,
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
        dispatch(activate())
      }

      // 로딩 메시지 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingMessage.id)
      );

      // 응답 메시지 처리
      processResponseMessage(responseMessage);
    } catch (error) {
      console.error("메시지 전송 오류:", error);

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

  return (
    <div className="chat-container">
      <div className="notice-text">
        우측 상단의{" "}
        <FontAwesomeIcon className="space" icon={faCircleQuestion} />에 마우스를
        올리면 가이드를 볼 수 있어요.
        <div className="download-button-th">
          <FontAwesomeIcon
            icon={faCircleQuestion}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          {isHovered && (
            <div className="home-chat-guide-th">
              <h4>
                안내: Kloudify 챗봇과 원활하게 소통하기 위해, 아래와 같은
                방식으로 질문하고 정보를 제공해주세요.
              </h4>
              1. 필요한 목적을 명확히 작성하기
              <br />
              예시: “개인 프로젝트에 필요한 웹 애플리케이션을 위해 서버와
              데이터베이스가 필요해요.”
              <br />
              <br />
              2. 간단하고 구체적으로 설명하기
              <br />
              예시: “트래픽이 많은 웹사이트가 아닌, 일반적인 블로그 서비스
              정도의 서버 성능이 필요해요.”
              <br />
              <br />
              3. 자신의 클라우드 경험 레벨을 알려주기
              <br />
              예시: “클라우드는 처음이라 기본적인 설정부터 배우고 싶어요.”
              <br />
              <br />
              4. 현재까지 구상한 구조를 공유하기 (혹은 필요한 구성 요소만
              열거해도 좋아요)
              <br />
              예시: “데이터베이스와 백엔드 서버만 있으면 됩니다.”
              <br />
              <br />
              챗봇 팁: 각 질문에 대한 답변을 바탕으로 클라우드 아키텍처가
              단계별로 설계됩니다. 필요에 따라 질문에 추가 정보를 더하거나,
              불필요한 부분을 생략해도 좋습니다.
            </div>
          )}
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

              <div className="message-content">{message.text}</div>

              {/* 체크박스가 존재하면 렌더링 */}
              {message.checks &&
                <div className="checkbox-container-th">
                  {message.nocheck && (
                    <label className="custom-checkbox" key={message.nocheck.label}>
                      <input
                        type="checkbox"
                        checked={selectedChecks[message.id]?.includes(message.nocheck.label) || false}
                        onChange={() =>
                          message.nocheck?.label && handleCheckChange(message.id, message.nocheck?.label, true)
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
              }

              {/* 서비스체크박스가 존재하면 렌더링 */}
              {message.servicechecks &&
                <div className="checkbox-container-th">
                  {message.servicechecks.map((check) => (
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
              }

              {/* 서브텍스트가 존재하면 렌더링 */}
              {message.subtext && (
                <p className="template-sub-th">{message.subtext}</p>
              )}

              {/* 노버튼이 존재하면 렌더링 */}
              {message.nobutton && (
                <button
                  key={message.nobutton.id}
                  className="important-template-btn-th"
                  onClick={() => message.nobutton && handleButtonClick(message.id, message.nobutton)}
                >
                  {message.nobutton.label}
                </button>
              )}


              {/* 버튼이 존재하면 렌더링 */}
              {message.buttons &&
                message.buttons.map((button) => (
                  <button
                    key={button.id}
                    className="template-btn-th"
                    onClick={() => handleButtonClick(message.id, button)}
                  >
                    {button.label}
                  </button>
                ))}

              {/* 체크박스 제출 버튼 */}
              {(message.checks || message.servicechecks) && (
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