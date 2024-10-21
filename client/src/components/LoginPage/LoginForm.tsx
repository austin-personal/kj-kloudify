import React, { useState } from 'react';
import { login } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

interface LoginFormProps {
    onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = await login(email, password);
            // JWT 토큰을 로컬 스토리지에 저장
            localStorage.setItem('token', token);
            alert('Login successful!');
            navigate('/home'); // 홈 페이지로 이동
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="auth-form">
            <h1>Kloudify</h1>
            <form className='form' onSubmit={handleLogin}>
                <input
                    type='id'
                    placeholder="Id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">로그인</button>
            </form>
            <div className="divider">또는</div>
            <button className="google-login">Google로 로그인</button>
            <div className="auth-signup">
                계정이 없으신가요? <span className='signup-toggle' onClick={onSwitchToSignup}>가입하기</span>
            </div>
        </div>
    );
};

export default LoginForm;
