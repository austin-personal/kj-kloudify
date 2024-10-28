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
import { useTemplates } from "./TemplateProvider";

interface ChatProps {
  projectCID: number;
  onParsedData?: (data: string[]) => void; // 새로운 prop 추가
  onFinishData?: (data: string[]) => void; // 새로운 prop 추가
}

interface Message {
  id: string;
  text: string | JSX.Element;
  sender: "user" | "bot";
  maxLength?: number;
  buttons?: { id: number; label: string }[];
  checks?: { id: number; label: string }[];
}

const defaultBotMessage: Message = {
  id: uuidv4(),
  text: "이 프로젝트의 최종 목표는 무엇인가요? (예: 개인 학습, 소규모 비즈니스, 대규모 배포)",
  sender: "bot",
};

const Chat: React.FC<ChatProps> = ({ projectCID, onParsedData, onFinishData }) => {
  const templates = useTemplates();
  const targetTemplateNames = ["서버", "디비", "네트워크", "스토리지", "모니터링"];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [selectedChecks, setSelectedChecks] = useState<{ [key: string]: string[]; }>({});
  const [isHovered, setIsHovered] = useState(false);

  // 대화 로딩
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const initialMessages = await open(projectCID, token);
        if (initialMessages && initialMessages.length > 0) {
          setMessages([defaultBotMessage]);
          const formattedMessages: Message[] = initialMessages.flatMap((msg: any, index: number) => {
            // userMessage에서 - 이후의 부분만 가져오기
            const parsedUserMessage = msg.userMessage.includes("-")
              ? msg.userMessage.slice(msg.userMessage.indexOf("-") + 1).trim()
              : msg.userMessage;

            // botResponse에서 !! 이전의 부분만 가져오기
            let parsedBotResponse = msg.botResponse.includes("!!")
              ? msg.botResponse.split("!!")[0].trim()
              : msg.botResponse;

            if (parsedBotResponse.includes("**")) {
              parsedBotResponse = parsedBotResponse.split("**")[0].trim()
            }

            const matchingTemplate = Object.values(templates).find(
              (template) => template.name === parsedBotResponse
            );

            // 마지막 메시지인지 확인
            const isLastMessage = index === initialMessages.length - 1;

            if (matchingTemplate) {
              return [
                {
                  id: uuidv4(),
                  text: parsedUserMessage,
                  sender: "user",
                },
                {
                  id: uuidv4(),
                  text: matchingTemplate.text,
                  sender: "bot",
                  buttons: isLastMessage ? matchingTemplate.buttons : undefined,
                },
              ];
            } else {
              return [
                {
                  id: uuidv4(),
                  text: parsedUserMessage,
                  sender: "user",
                },
                {
                  id: uuidv4(),
                  text: parsedBotResponse,
                  sender: "bot",
                },
              ];
            }
          });
          setMessages((prevMessages) => [...prevMessages, ...formattedMessages]);

          // 마지막 botResponse에서 "!!" 뒤의 부분을 파싱하여 onParsedData로 전달
          const lastBotResponse = initialMessages[initialMessages.length - 1].botResponse;

          if (lastBotResponse.includes("!!")) {
            const afterAsterisks = lastBotResponse.split("!!")[1].trim();

            let parsedDataArray: string[] = [];

            try {
              // JSON 배열로 파싱 시도
              parsedDataArray = JSON.parse(afterAsterisks);
              if (!Array.isArray(parsedDataArray)) {
                throw new Error("파싱된 데이터가 배열이 아님");
              }
            } catch (e) {
              console.error("JSON 파싱 실패, 수동으로 파싱 시도:", e);
              // 수동으로 파싱
              let dataString = afterAsterisks.replace(/^\[|\]$/g, "");
              parsedDataArray = dataString.split(",").map((item: string) => item.trim());
            }

            // 부모에게 파싱된 데이터 전달
            if (onParsedData) {
              onParsedData(parsedDataArray);
            }
          } else if (lastBotResponse.includes("**")) {
            const afterAsterisks = lastBotResponse.split("**")[1].trim();

            let parsedDataArray: string[] = [];

            try {
              // JSON 배열로 파싱 시도
              parsedDataArray = JSON.parse(afterAsterisks);
              if (!Array.isArray(parsedDataArray)) {
                throw new Error("파싱된 데이터가 배열이 아님");
              }
            } catch (e) {
              console.error("JSON 파싱 실패, 수동으로 파싱 시도:", e);
              // 수동으로 파싱
              let dataString = afterAsterisks.replace(/^\[|\]$/g, "");
              parsedDataArray = dataString.split(",").map((item: string) => item.trim());
            }

            // 부모에게 파싱된 데이터 전달
            if (onFinishData) {
              onFinishData(parsedDataArray);
            }
          }

        }
        else {
          setMessages([defaultBotMessage]);
        }
      } catch (error) {
        setMessages([defaultBotMessage]);
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

  // messages 배열이 변경될 때마다 스크롤을 아래로 이동
  useEffect(() => {
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
  const handleCheckChange = (messageId: string, label: string) => {
    setSelectedChecks((prevState) => {
      const currentChecks = prevState[messageId] || [];
      if (currentChecks.includes(label)) {
        return {
          ...prevState,
          [messageId]: currentChecks.filter((item) => item !== label),
        };
      } else {
        return {
          ...prevState,
          [messageId]: [...currentChecks, label],
        };
      }
    });
  };

  // 체크박스 제출 핸들러
  const handleCheckSubmit = (messageId: string) => {
    const selectedLabels = selectedChecks[messageId] || [];
    if (selectedLabels.length > 0) {
      handleButtonClick(messageId, {
        id: 0,
        label: `@@##${selectedLabels.join(", ")}`,
      });
    }
  };

  // 응답 메시지를 처리하는 함수
  const processResponseMessage = (responseMessage: string) => {
    if (responseMessage.includes("!!")) {
      const [beforeAsterisks, afterAsterisks] = responseMessage
        .split("!!")
        .map((part) => part.trim());

      // "!!"뒤에 있는 데이터를 배열형태로 받기
      let parsedDataArray: string[] = [];

      try {
        // JSON배열로 파싱
        parsedDataArray = JSON.parse(afterAsterisks);
        if (!Array.isArray(parsedDataArray)) {
          throw new Error("파싱된 데이터가 배열이 아님");
        }
      } catch (e) {
        console.error("'!!'뒤에있는 데이터를 JSON배열로 파싱하는거 실패 :", e);
        // 만약 JSON배열이 아니면 매뉴얼대로 파싱
        let dataString = afterAsterisks.replace(/^\[|\]$/g, "");
        parsedDataArray = dataString.split(",").map((item) => item.trim());
      }

      // 부모에게 파싱된 데이터 보내기
      if (onParsedData) {
        onParsedData(parsedDataArray);
      }

      // 이제 beforeAsterisks가 템플릿 이름과 매치하는지 찾기
      const matchingTemplate = Object.values(templates).find(
        (template) => template.name === beforeAsterisks
      );

      // 만약 일치한다면
      if (matchingTemplate) {
        // 템플릿을 묘사해라
        const newBotMessage: Message = {
          id: uuidv4(),
          text: matchingTemplate.text,
          sender: "bot",
          buttons: matchingTemplate.buttons,
          checks: matchingTemplate.checks,
        };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
        // 일치 안한다면
      } else {
        // 그냥 평범하게 메세지 출력해라
        const botMessage: Message = {
          id: uuidv4(),
          text: beforeAsterisks,
          sender: "bot",
          maxLength: 50,
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } else if (responseMessage.includes("**")) {
      const [beforeAsterisks, afterAsterisks] = responseMessage
        .split("**")
        .map((part) => part.trim());

      // "**"뒤에 있는 데이터를 배열형태로 받기
      let parsedDataArray: string[] = [];

      try {
        // JSON배열로 파싱
        parsedDataArray = JSON.parse(afterAsterisks);
        if (!Array.isArray(parsedDataArray)) {
          throw new Error("파싱된 데이터가 배열이 아님");
        }
      } catch (e) {
        console.error("'**'뒤에있는 데이터를 JSON배열로 파싱하는거 실패 :", e);
        // 만약 JSON배열이 아니면 매뉴얼대로 파싱
        let dataString = afterAsterisks.replace(/^\[|\]$/g, "");
        parsedDataArray = dataString.split(",").map((item) => item.trim());
      }

      // 부모에게 파싱된 데이터 보내기
      if (onFinishData) {
        onFinishData(parsedDataArray);
      }

      // 이제 beforeAsterisks가 템플릿 이름과 매치하는지 찾기
      const matchingTemplate = Object.values(templates).find(
        (template) => template.name === beforeAsterisks
      );

      // 만약 일치한다면
      if (matchingTemplate) {
        // 템플릿을 묘사해라
        const newBotMessage: Message = {
          id: uuidv4(),
          text: matchingTemplate.text,
          sender: "bot",
          buttons: matchingTemplate.buttons,
          checks: matchingTemplate.checks,
        };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
        // 일치 안한다면
      } else {
        // 그냥 평범하게 메세지 출력해라
        const botMessage: Message = {
          id: uuidv4(),
          text: beforeAsterisks,
          sender: "bot",
          maxLength: 50,
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } else {
      const matchingTemplate = Object.values(templates).find(
        (template) => template.name === responseMessage
      );
      // 만약 일치한다면
      if (matchingTemplate) {
        // 템플릿을 묘사해라
        const newBotMessage: Message = {
          id: uuidv4(),
          text: matchingTemplate.text,
          sender: "bot",
          buttons: matchingTemplate.buttons,
          checks: matchingTemplate.checks,
        };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
        // 일치 안한다면
      } else {
        // 일반적인 응답 처리
        const botMessage: Message = {
          id: uuidv4(),
          text: responseMessage,
          sender: "bot",
          maxLength: 50,
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    }
  };

  // 메시지 전송 핸들러 (인풋 필드용)
  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        // 템플릿의 text와 일치하는지 확인
        const matchingTemplate = Object.values(templates).find(
          (template) => template.text === lastBotMessage.text
        );

        // 특정 템플릿 이름과 일치하는지 확인
        if (
          matchingTemplate &&
          targetTemplateNames.includes(matchingTemplate.name)
        ) {
          messageToSend = `${lastBotMessage.text} = ${matchingTemplate.name}선택 - ${input}`;
        } else {
          messageToSend = `${lastBotMessage.text} - ${input}`;
        }
      } else {
        messageToSend = input;
      }

      const responseMessage = await ask(messageToSend, projectCID);

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

  // 버튼 클릭 핸들러
  const handleButtonClick = async (
    messageId: string,
    button: { id: number; label: string }
  ) => {
    // 해당 메시지에서 버튼 제거
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId
          ? { ...msg, buttons: undefined, checks: undefined }
          : msg
      )
    );

    // 사용자 메시지 추가
    let userMessageText: string;

    userMessageText = button.label;

    const userMessage: Message = {
      id: uuidv4(),
      text: userMessageText,
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
        // 템플릿의 text와 일치하는지 확인
        const matchingTemplate = Object.values(templates).find(
          (template) => template.text === lastBotMessage.text
        );

        // 특정 템플릿 이름과 일치하는지 확인
        if (
          matchingTemplate &&
          targetTemplateNames.includes(matchingTemplate.name)
        ) {
          messageToSend = `${lastBotMessage.text} = ${matchingTemplate.name}선택 - ${userMessageText}`;
        } else {
          messageToSend = `${lastBotMessage.text} - ${userMessageText}`;
        }
      } else {
        messageToSend = userMessageText;
      }

      const responseMessage = await ask(messageToSend, projectCID);

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
        우측 상단의 <FontAwesomeIcon className="space" icon={faCircleQuestion} />에 마우스를 올리면 가이드를 볼 수 있어요.
        <div className="download-button-th">
          <FontAwesomeIcon
            icon={faCircleQuestion}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          {isHovered &&
            <div className="home-chat-guide-th">
              <h4>안내: Kloudify 챗봇과 원활하게 소통하기 위해, 아래와 같은 방식으로 질문하고 정보를 제공해주세요.</h4>
              1. 필요한 목적을 명확히 작성하기
              <br />
              예시: “개인 프로젝트에 필요한 웹 애플리케이션을 위해 서버와 데이터베이스가 필요해요.”
              <br />
              <br />
              2. 간단하고 구체적으로 설명하기
              <br />
              예시: “트래픽이 많은 웹사이트가 아닌, 일반적인 블로그 서비스 정도의 서버 성능이 필요해요.”
              <br />
              <br />
              3. 자신의 클라우드 경험 레벨을 알려주기
              <br />
              예시: “클라우드는 처음이라 기본적인 설정부터 배우고 싶어요.”
              <br />
              <br />
              4. 현재까지 구상한 구조를 공유하기 (혹은 필요한 구성 요소만 열거해도 좋아요)
              <br />
              예시: “데이터베이스와 백엔드 서버만 있으면 됩니다.”
              <br />
              <br />
              챗봇 팁: 각 질문에 대한 답변을 바탕으로 클라우드 아키텍처가 단계별로 설계됩니다. 필요에 따라 질문에 추가 정보를 더하거나, 불필요한 부분을 생략해도 좋습니다.
            </div>
          }
        </div>
      </div >
      <div className="message-list" ref={scrollRef}>
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            {message.sender === "bot" && (
              <FontAwesomeIcon className="bot-icon" icon={faCloud} />
            )}
            <div className={`message ${message.sender}-message`}>
              {message.sender === "bot" ? (
                <div
                  className="message-content"
                >
                  {typeof message.text === "string" ? (
                    <TypingMessage
                      text={message.text}
                      maxLength={message.maxLength || 100}
                    />
                  ) : (
                    message.text
                  )}
                </div>
              ) : (
                message.text
              )}

              {/* 체크박스가 존재하면 렌더링 */}
              {message.checks &&
                message.checks.map((check) => (
                  <>
                    <div className="checkbox-container-th">
                      <label className="custom-checkbox" key={check.label}>
                        <input
                          type="checkbox"
                          onChange={() =>
                            handleCheckChange(message.id, check.label)
                          }
                        />
                        <span className="checkbox-mark"></span>
                        {check.label}
                      </label>
                    </div>
                  </>
                ))}

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
              {message.checks && (
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

      {/* 스크롤을 아래로 이동하는 버튼 */}
      {showScrollButton && (
        <>
          <FontAwesomeIcon
            className="scroll-to-bottom"
            onClick={scrollToBottom}
            icon={faCircleDown}
            size="2xl"
          />
          <div className="scroll-background"></div>
        </>
      )}

      <div className="input-container">
        <form className="chat-form" onSubmit={handleSendMessage}>
          <input
            className="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
          />
          <button type="submit" className="chat-button-sa">
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

interface TypingMessageProps {
  text: string;
  maxLength: number;
}

const TypingMessage: React.FC<TypingMessageProps> = ({ text, maxLength }) => {
  const [typedText, setTypedText] = useState("");
  const [typingStopped, setTypingStopped] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typedText.length < maxLength) {
        setTypedText(text.slice(0, typedText.length + 1));
      } else {
        setTypingStopped(true);
        setTypedText(text);
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [typedText, maxLength, text]);

  return <div>{typingStopped ? <p>{text}</p> : <p>{typedText}|</p>}</div>;
};

export default Chat;