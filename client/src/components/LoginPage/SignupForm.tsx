import React, { useState } from "react";
import { signup } from "../../services/users";
import "./AuthForm.css";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signup(username, email, password);
      alert("Signup successful! Please log in.");
      onSwitchToLogin(); // 회원가입 성공 시 로그인 화면으로 전환
    } catch (error) {
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="auth-form">
      <h2>회원가입</h2>
      <form className="login-form" onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">가입하기</button>
      </form>
      <div className="auth-login">
        이미 계정이 있으신가요?{" "}
        <span className="login-toggle" onClick={onSwitchToLogin}>
          로그인
        </span>
      </div>
    </div>
  );
};

export default SignupForm;
