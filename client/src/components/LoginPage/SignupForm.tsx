import React, { useState } from 'react';
import { signup } from '../../services/authService';
import './AuthForm.css';

interface SignupFormProps {
    onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await signup(username, email, password);
            alert('Signup successful! Please log in.');
            onSwitchToLogin(); // 회원가입 성공 시 로그인 화면으로 전환
        } catch (error) {
            alert('Signup failed. Please try again.');
        }
    };

    return (
        <div className="auth-form">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
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
                <button type="submit">Sign Up</button>
            </form>
            <div className="auth">
                Already have an account? <span className='login-toggle' onClick={onSwitchToLogin}>Log in</span>
            </div>
        </div>
    );
};

export default SignupForm;