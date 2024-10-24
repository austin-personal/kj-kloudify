import React, { useState, useEffect, useRef } from "react";
import { ask } from "../../services/conversations";
import "./Chat.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDown, faCloud, faPaperPlane, } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid"; // UUID 가져오기
import { useTemplates } from "./TemplateProvider";

interface ChatProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectCID: number;
  onParsedData?: (data: string[]) => void; // 새로운 prop 추가
}

interface Message {
  id: string;
  text: string | JSX.Element;
  sender: "user" | "bot";
  maxLength?: number;
  buttons?: { id: number; label: string }[];
  checks?: { id: number; label: string }[];
}

const templates: Record<number, Template> = {
  1: {
    name: "어떤 웹사이트를 만들고 싶으세요? (ex. 카메라를 켜놓고 나의 운동 동작을 파악하는 웹사이트야)",
    buttons: [],
  },
  3: {
    name: "서버는 어떤 서버를 원하시나요?",
    buttons: [
      { id: 6, label: "EC2" },
      { id: 7, label: "Lambda" },
      { id: 8, label: "Elastic beanstalk" },
    ],
  },
 4: {
    name: "서버를 어떻게 설정 할까요? ",
    buttons: [
      { id: 6, label: "t2.micro" },
      { id: 7, label: "c5.large" },
      { id: 8, label: "r5.large" },
    ],
  },
  5: {
    name: "DB는 어떤 DB를 원하시나요?",
    buttons: [
      { id: 9, label: "DynamoDB" },
      { id: 10, label: "DocumentDB" },
      { id: 11, label: "RDS" },
    ],
  },
 6: {
    name: "DB를 어떻게 설정 할까요? ",
    buttons: [
      { id: 6, label: "SSD GP2" },
      { id: 7, label: "IOPS SSD IO1" },
      { id: 8, label: "Standard" },
    ],
  },

};

const Chat: React.FC<ChatProps> = ({ setIsOpen, projectCID, onParsedData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      text: "어떤것을 만들고 싶나요?",
      sender: "bot",
      buttons: [
        { id: 1, label: "웹사이트" },
        { id: 2, label: "게임" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [selectedChecks, setSelectedChecks] = useState<{ [key: string]: string[] }>({});

  // 메시지 추가 후 자동으로 스크롤을 아래로 이동시키는 함수
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
          [messageId]: [...currentChecks, label]
        }
      }
    })
  }

  // 체크박스 제출 핸들러
  const handleCheckSubmit = (messageId: string) => {
    const selectedLabels = selectedChecks[messageId] || [];
    if (selectedLabels.length > 0) {
      handleButtonClick(messageId, { id: 0, label: selectedLabels.join(", ") });
    }
  };

  // 응답 메시지를 처리하는 함수
  const processResponseMessage = (responseMessage: string) => {
    if (typeof responseMessage === "string" && responseMessage.includes("**")) {
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
          text: matchingTemplate.name,
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
      // 일반적인 응답 처리
      const botMessage: Message = {
        id: uuidv4(),
        text: responseMessage,
        sender: "bot",
        maxLength: 50,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }
  };

  // 메시지 전송 핸들러 (인풋 필드용)
  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (input.trim() === "") return; // 빈 메시지 방지

    const userMessage: Message = {
      id: uuidv4(),
      text: input,
      sender: "user",
    };
    setMessages([...messages, userMessage]);
    setInput(""); // 인풋 필드 초기화

    const loadingMessage: Message = {
      id: uuidv4(),
      text: <div className="loader"></div>,
      sender: "bot",
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    try {
      const responseMessage = await ask(input, projectCID);

      // 로딩 메시지 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingMessage.id)
      );

      // 응답 메시지 처리
      processResponseMessage(responseMessage);
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      // 오류 메시지 추가 (선택 사항)
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
        msg.id === messageId ? { ...msg, buttons: undefined } : msg
      )
    );

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: uuidv4(),
      text: button.label,
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
      const responseMessage = await ask(button.label, projectCID);

      // 로딩 메시지 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingMessage.id)
      );

      // 응답 메시지 처리
      processResponseMessage(responseMessage);
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      // 오류 메시지 추가 (선택 사항)
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
        메세지를 누르면 자세한 설명을 볼 수 있어요.
      </div>

      <div className="message-list" ref={scrollRef}>
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            {message.sender === "bot" && (
              <FontAwesomeIcon className="bot-icon" icon={faCloud} />
            )}
            <div className={`message ${message.sender}-message"`}>
              {message.sender === "bot" ? (
                <div
                  onClick={() => setIsOpen(true)}
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
              {
                message.checks &&
                message.checks.map((check) => (
                  <>
                    <input type="checkbox"
                      onChange={() => handleCheckChange(message.id, check.label)}
                    />
                    {check.label}
                  </>
                ))
              }

              {/* 버튼이 존재하면 렌더링 */}
              {message.buttons &&
                message.buttons.map((button) => (
                  <button
                    key={button.id}
                    className="templete-btn-th"
                    onClick={() => handleButtonClick(message.id, button)}
                  >
                    {button.label}
                  </button>
                ))}

              {/* 체크박스 제출 버튼 */}
              {message.checks && (
                <button
                  onClick={() => handleCheckSubmit(message.id)}
                  className="check-submit-button"
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
