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
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
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
                <button type="submit">Login</button>
            </form>
            <div className="divider">- or -</div>
            <button className="google-login">Login with Google</button>
            <div className="auth">
                Don't have an account? <span className='signup-toggle' onClick={onSwitchToSignup}>Sign up</span>
            </div>
        </div>
    );
};

export default LoginForm;
