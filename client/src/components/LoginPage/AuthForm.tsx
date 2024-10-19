import React from 'react';
import './AuthForm.css';

interface AuthFormProps {
    onLogin: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // 일단 지금은 냅다 로그인 성공
        onLogin();
    };

    return (
        <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="ID" />
                <input type="password" placeholder="Password" />
                <button type="submit">Login</button>
            </form>
            <div className="divider">- or -</div>
            <button className="google-login">Login with Google</button>
            <div className="auth-toggle">
                Don't have an account? <span>Sign up</span>
            </div>
        </div>
    );
};

export default AuthForm;
