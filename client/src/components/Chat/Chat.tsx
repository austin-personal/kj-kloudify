import React, { useState, useEffect, useRef } from "react";
import { ask } from "../../services/conversations";
import "./Chat.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleDown,
  faCloud,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid"; // UUID 가져오기

interface ChatProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectCID: number;
}

interface Message {
  id: string;
  text: string | JSX.Element;
  sender: "user" | "bot";
  maxLength?: number;
  buttons?: { id: number; label: string }[];
}

interface Template {
  name: string;
  buttons: { id: number; label: string }[];
}

const templates: Record<number, Template> = {
  1: {
    name: "템플릿 1",
    buttons: [
      { id: 1, label: "옵션 1" },
      { id: 2, label: "옵션 2" },
    ],
  },
  2: {
    name: "템플릿 2",
    buttons: [
      { id: 3, label: "옵션 3" },
      { id: 4, label: "옵션 4" },
    ],
  },
  3: {
    name: "템플릿 3",
    buttons: [
      { id: 5, label: "옵션 5" },
      { id: 6, label: "옵션 6" },
    ],
  },
};

const Chat: React.FC<ChatProps> = ({ setIsOpen, projectCID }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      text: "골라",
      sender: "bot",
      buttons: [
        { id: 1, label: "1번" },
        { id: 2, label: "2번" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

      // 응답이 '**'로 시작하는지 확인
      if (typeof responseMessage === "string" && responseMessage.startsWith("**")) {
        const number = parseInt(responseMessage.slice(2), 10);
        if (templates[number]) {
          const template = templates[number];
          const newBotMessage: Message = {
            id: uuidv4(),
            text: template.name,
            sender: "bot",
            buttons: template.buttons,
          };
          setMessages((prevMessages) => [...prevMessages, newBotMessage]);
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

      // 응답이 '**'로 시작하는지 확인
      if (typeof responseMessage === "string" && responseMessage.startsWith("**")) {
        const number = parseInt(responseMessage.slice(2), 10);
        if (templates[number]) {
          const template = templates[number];
          const newBotMessage: Message = {
            id: uuidv4(),
            text: template.name,
            sender: "bot",
            buttons: template.buttons,
          };
          setMessages((prevMessages) => [...prevMessages, newBotMessage]);
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
            <div
              className={`message ${
                message.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
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
            placeholder="Type a message..."
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

  return (
    <div>
      {typingStopped ? <p>{text}</p> : <p>{typedText}|</p>}
    </div>
  );
};

export default Chat;
