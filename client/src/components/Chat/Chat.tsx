import React, { useState, useEffect, useRef } from "react";
import { ask } from "../../services/conversations";
import "./Chat.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleDown,
  faCloud,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
// import axios from "axios"; //백엔드 연결 위함
//id 값에 date 대신 더 안정성있는 uuid 방식 사용/ 고유한 식별자를 생성하기 때문
const { v4: uuidv4 } = require("uuid");

interface ChatProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectCID: number;
}

interface Message {
  id: number;
  text: string | JSX.Element;
  sender: "user" | "bot";
  maxLength?: number;
}
const Chat: React.FC<ChatProps> = ({ setIsOpen, projectCID }) => {
  const [messages, setMessages] = useState<Message[]>([]);
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

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (input.trim() === "") return; //빈 메세지 이면 리턴

    const userMessage: Message = {
      id: uuidv4(),
      text: input,
      sender: "user",
    };
    setMessages([...messages, userMessage]);
    setInput(""); //메세지 전송 후 인풋창 초기화
    const loadingMessage: Message = {
      id: uuidv4(),
      text: <div className="loader"></div>,
      sender: "bot",
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);
    try {
      const responseMessage = await ask(input, projectCID);
      const botMessage: Message = {
        id: uuidv4(),
        text: responseMessage,
        sender: "bot",
        maxLength: 50,
      };
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => msg.id !== loadingMessage.id),
        botMessage,
      ]);
    } catch (error) {}
  };
  return (
    <div className="chat-container">
      <div className="notice-text">
        메세지를 누르면 자세한 설명을 볼 수 있어요.
      </div>
      <div className="message-list " ref={scrollRef}>
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
                    message.text // JSX Element인 경우 직접 렌더링
                  )}
                </div>
              ) : (
                message.text
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* 최근 메시지로 이동 버튼 */}
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
        // 타이핑된 글자가 maxLength에 도달하지 않았을 때
        setTypedText(text.slice(0, typedText.length + 1));
      } else {
        // 글자가 maxLength에 도달하면 전체 텍스트 표시하고 타이핑 중단
        setTypingStopped(true);
        setTypedText(text);
        clearInterval(intervalId); // 타이핑 중단
      }
    }, 50); // 타이핑 속도

    return () => clearInterval(intervalId); // 컴포넌트가 언마운트될 때 타이머 제거
  }, [typedText, maxLength, text]);

  return (
    <div>
      {typingStopped ? (
        <p>{text}</p> // 타이핑 중단 후 전체 텍스트 표시
      ) : (
        <p>{typedText}|</p> // 타이핑되는 텍스트
      )}
    </div>
  );
};

export default Chat;
