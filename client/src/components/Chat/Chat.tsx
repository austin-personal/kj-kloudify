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
import { info } from "../../services/users";

interface ChatProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectCID: number;
  onParsedData?: (data: string[]) => void;
}

interface Message {
  id: string;
  text: string | JSX.Element;
  sender: "user" | "bot";
  maxLength?: number;
  buttons?: { id: number; label: string }[];
  check?: { id: number; label: string }[];
}

interface Template {
  name: string;
  buttons?: { id: number; label: string }[];
  check?: { id: number; label: string }[];
}

const templates: Record<number, Template> = {
  0: {
    name: "{{userProfile}}님 어떤것을 만들고 싶나요?",
    buttons: [
      { id: 1, label: "간단한 웹사이트" },
      { id: 2, label: "간단한 게임" },
    ],
  },
  1: {
    name: "어떤 {{selectedOption}}를 만들고 싶으세요? (예: 카메라를 켜놓고 나의 운동 동작을 파악하는 웹사이트야)",
  },
  2: {
    name: "어떤 인프라가 필요하신가요?",
    check: [
      { id: 3, label: "서버" },
      { id: 4, label: "DB" },
      { id: 5, label: "Storage" },
    ],
  },
  3: {
    name: "서버는 어떤 서버를 원하시나요?",
    buttons: [
      { id: 6, label: "EC2" },
      { id: 7, label: "Lambda" },
      { id: 8, label: "Elastic Beanstalk" },
    ],
  },
  4: {
    name: "{{selectedService}}를 어떻게 설정할까요?",
    buttons: [
      { id: 9, label: "t2.micro" },
      { id: 10, label: "c5.large" },
      { id: 11, label: "r5.large" },
    ],
  },
  5: {
    name: "DB는 어떤 DB를 원하시나요?",
    buttons: [
      { id: 12, label: "DynamoDB" },
      { id: 13, label: "DocumentDB" },
      { id: 14, label: "RDS" },
    ],
  },
  6: {
    name: "{{selectedService}}를 어떻게 설정할까요?",
    buttons: [
      { id: 15, label: "SSD GP2" },
      { id: 16, label: "IOPS SSD IO1" },
      { id: 17, label: "Standard" },
    ],
  },
};

const Chat: React.FC<ChatProps> = ({ setIsOpen, projectCID, onParsedData }) => {
  const [userProfile, setUserProfile] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          // 유저 정보 가져오기
          const userData = await info(token);
          setUserProfile(userData.user.username);
        }
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
      }
    };

    fetchData();
  }, [token]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [currentTemplateIndex, setCurrentTemplateIndex] = useState<number>(0);
  const [userSelections, setUserSelections] = useState<{ [key: string]: any }>({});
  const [templatesQueue, setTemplatesQueue] = useState<number[]>([0]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);

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
  }, [scrollRef.current]);

  useEffect(() => {
    if (userProfile) {
      proceedToNextTemplate();
    }
  }, [userProfile]);

  // 다음 템플릿으로 진행하는 함수 수정
  const proceedToNextTemplate = (templateIndex?: number) => {
    let nextTemplateIndex: number | undefined;

    if (templateIndex !== undefined) {
      nextTemplateIndex = templateIndex;
    } else {
      nextTemplateIndex = templatesQueue.shift();
    }

    if (nextTemplateIndex !== undefined) {
      const template = templates[nextTemplateIndex];

      if (template) {
        let text = template.name;
        text = text.replace("{{userProfile}}", userProfile);
        text = text.replace("{{selectedOption}}", userSelections.selectedOption || "");
        text = text.replace("{{selectedService}}", userSelections.selectedService || "");

        const newBotMessage: Message = {
          id: uuidv4(),
          text: text,
          sender: "bot",
          buttons: template.buttons,
          check: template.check,
        };

        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
        setCurrentTemplateIndex(nextTemplateIndex);
      }
    }
  };

  // 버튼 클릭 핸들러 수정
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
      // 백엔드로 버튼 내용 전송
      const responseMessage = await ask(button.label, projectCID);

      // 로딩 메시지 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingMessage.id)
      );

      // 사용자 선택 업데이트
      if (currentTemplateIndex === 0) {
        setUserSelections((prev) => ({ ...prev, selectedOption: button.label }));
        setTemplatesQueue((prevQueue) => [...prevQueue, 1]);
      } else if (currentTemplateIndex === 3 || currentTemplateIndex === 5) {
        setUserSelections((prev) => ({ ...prev, selectedService: button.label }));
      }

      // 응답 메시지 처리
      processResponseMessage(responseMessage);
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      // 오류 메시지 추가
      const errorMessage: Message = {
        id: uuidv4(),
        text: "죄송합니다. 메시지를 보내는 데 실패했습니다.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  // 응답 메시지를 처리하는 함수 수정
  const processResponseMessage = (responseMessage: string) => {
    if (responseMessage.includes("**")) {
      const index = responseMessage.indexOf("**");
      const parsedPart = responseMessage.slice(index + 2).trim();

      let parsedDataArray: string[] = [];
      try {
        parsedDataArray = JSON.parse(parsedPart);
        if (!Array.isArray(parsedDataArray)) {
          throw new Error("Parsed data is not an array");
        }
      } catch (e) {
        console.error("Failed to parse data after '**' as JSON array:", e);
        let dataString = parsedPart.replace(/^\[|\]$/g, "");
        parsedDataArray = dataString.split(",").map((item) => item.trim());
      }

      if (onParsedData) {
        onParsedData(parsedDataArray);
      }

      // 다음 템플릿 인덱스를 직접 전달하여 호출
      if (currentTemplateIndex === 1) {
        proceedToNextTemplate(2);
      } else if (currentTemplateIndex === 4 || currentTemplateIndex === 6) {
        // 모든 템플릿 완료 시 처리
        console.log("모든 템플릿 완료");
      } else {
        proceedToNextTemplate();
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

      proceedToNextTemplate();
    }
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedCheckboxes((prev) =>
      event.target.checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  // 체크박스 확인 핸들러 수정
  const handleCheckboxConfirm = async (messageId: string) => {
    // 해당 메시지에서 체크박스 제거
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, check: undefined } : msg
      )
    );

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: uuidv4(),
      text: selectedCheckboxes.join(", "),
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
      // 백엔드로 체크박스 선택 사항 전송
      const responseMessage = await ask(selectedCheckboxes.join(", "), projectCID);

      // 로딩 메시지 제거
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingMessage.id)
      );

      setUserSelections((prev) => ({ ...prev, selectedInfra: selectedCheckboxes }));

      // 선택한 옵션에 따라 템플릿 큐에 추가
      const newQueue = [...templatesQueue];
      if (selectedCheckboxes.includes("서버")) {
        newQueue.push(3, 4); // 서버 관련 템플릿
      }
      if (selectedCheckboxes.includes("DB")) {
        newQueue.push(5, 6); // DB 관련 템플릿
      }
      setTemplatesQueue(newQueue);

      // 응답 메시지 처리
      processResponseMessage(responseMessage);

      setSelectedCheckboxes([]);
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      // 오류 메시지 추가
      const errorMessage: Message = {
        id: uuidv4(),
        text: "죄송합니다. 메시지를 보내는 데 실패했습니다.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
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
    setInput(""); // 인풋 필드 초기화

    // 사용자 입력에 따라 선택 사항 업데이트
    if (currentTemplateIndex === 1) {
      setUserSelections((prev) => ({ ...prev, userInput: input }));
    }

    // 로딩 메시지 추가
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
        메시지를 누르면 자세한 설명을 볼 수 있어요.
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

              {/* 체크박스가 존재하면 렌더링 */}
              {message.check && (
                <div>
                  {message.check.map((checkbox) => (
                    <label key={checkbox.id}>
                      <input
                        type="checkbox"
                        value={checkbox.label}
                        onChange={handleCheckboxChange}
                      />
                      {checkbox.label}
                    </label>
                  ))}
                  <button onClick={() => handleCheckboxConfirm(message.id)}>
                    확인
                  </button>
                </div>
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

  return (
    <div>
      {typingStopped ? <p>{text}</p> : <p>{typedText}|</p>}
    </div>
  );
};

export default Chat;