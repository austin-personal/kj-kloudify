import React, { useState } from "react";
import { checkEmail, signup } from "../../services/users";
import "./AuthForm.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string; passwordConfirm?: string }>({});
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      setErrors((prevErrors) => ({ ...prevErrors, username: "사용자 이름을 입력해 주세요" }));
      return false;
    }
    if (/\s/.test(username)) {
      setErrors((prevErrors) => ({ ...prevErrors, username: "사용자 이름에 빈칸을 포함할 수 없습니다" }));
      return false;
    }
    setErrors((prevErrors) => ({ ...prevErrors, username: undefined }));
    return true;
  };

  const validateEmail = (email: string) => {
    if (!emailRegex.test(email)) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "유효하지 않은 이메일 형식입니다" }));
      return false;
    }
    setErrors((prevErrors) => ({ ...prevErrors, email: undefined }));
    return true;
  };

  const validatePassword = (password: string) => {
    if (!passwordRegex.test(password)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "영어 대소문자, 숫자, 특수문자가 모두 포함되어야 합니다",
      }));
      return false;
    }
    setErrors((prevErrors) => ({ ...prevErrors, password: undefined }));
    return true;
  };

  const validatePasswordConfirm = (passwordConfirm: string) => {
    if (passwordConfirm !== password) {
      setErrors((prevErrors) => ({ ...prevErrors, passwordConfirm: "비밀번호가 다릅니다" }));
      return false;
    }
    setErrors((prevErrors) => ({ ...prevErrors, passwordConfirm: undefined }));
    return true;
  };

  const handleEmailCheck = async () => {
    if (!validateEmail(email)) {
      return;
    }
    try {
      const isDuplicate = await checkEmail(email);
      if (isDuplicate) {
        setErrors((prevErrors) => ({ ...prevErrors, email: "이미 사용중인 이메일입니다" }));
      } else {
        setIsEmailChecked(true);
        setIsEmailValid(true);
        setErrors((prevErrors) => ({ ...prevErrors, email: undefined }));
      }
    } catch (error) {
      alert("이메일 확인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isPasswordConfirmValid = validatePasswordConfirm(passwordConfirm);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isPasswordConfirmValid || !isEmailChecked) {
      if (!isEmailChecked) {
        setErrors((prevErrors) => ({ ...prevErrors, email: "이메일 중복 확인을 해주세요" }));
      }
      return;
    }

    try {
      await signup(username, email, password);
      alert("회원가입이 완료되었습니다. 로그인 해주세요.");
      onSwitchToLogin(); // 회원가입 성공 시 로그인 화면으로 전환
    } catch (error) {
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="auth-form">
      <div className="signup-title-th">
        회원가입
      </div>
      <form className="login-form" onSubmit={handleSignup}>
        <div className="input-container-th">
          <input
            className="login-form-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) validateUsername(e.target.value);
            }}
            onBlur={() => validateUsername(username)}
          />
          <div className="error-space">{errors.username && <span className="error-message-th">{errors.username}</span>}</div>
        </div>

        <div className="input-container-th">
          <div className="email-check-section">
            <input
              className="email-input-th"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsEmailChecked(false);  // 이메일 변경 시 중복 체크 상태 초기화
                setIsEmailValid(false);    // 이메일 변경 시 유효 상태 초기화
                if (errors.email) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
            />
            <button
              className={`email-btn-th ${isEmailValid ? "email-checked" : ""}`} // 버튼 스타일 변경
              type="button"
              onClick={handleEmailCheck}
              disabled={isEmailChecked}
            >
              {isEmailValid ? (
                <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
              ) : (
                "중복"
              )}
            </button>
          </div>
          <div className="error-space">{errors.email && <span className="error-message-th">{errors.email}</span>}</div>
        </div>

        <div className="input-container-th">
          <input
            className="login-form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) validatePassword(e.target.value);
            }}
            onBlur={() => validatePassword(password)}
          />
          <div className="error-space">{errors.password && <span className="error-message-th">{errors.password}</span>}</div>
        </div>

        <div className="input-container-th">
          <input
            className="login-form-input"
            type="password"
            placeholder="Confirm Password"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              if (errors.passwordConfirm) validatePasswordConfirm(e.target.value);
            }}
            onBlur={() => validatePasswordConfirm(passwordConfirm)}
          />
          <div className="error-space">{errors.passwordConfirm && <span className="error-message-th">{errors.passwordConfirm}</span>}</div>
        </div>

        <button className="signup-button-th" type="submit">가입하기</button>
      </form>
      <div className="auth-signup">
        이미 계정이 있으신가요?{" "}
        <span className="login-toggle" onClick={onSwitchToLogin}>
          로그인
        </span>
      </div>
    </div>
  );
};

export default SignupForm;
