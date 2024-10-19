import React from 'react';
import './AuthForm.css';

interface AuthFormProps {
    setIsLoggedIn: (loggedIn: boolean) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ setIsLoggedIn }) => {
    const handleLogin = () => {
        // 로그인 성공 시 setIsLoggedIn을 호출하여 상태를 true로 설정
        setIsLoggedIn(true);
    };

    return (
        <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
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
