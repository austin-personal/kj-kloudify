import React from 'react';
import IntroSection from './IntroSection';
import AuthForm from './AuthForm';
import './LoginPage.css';

interface LoginPageProps {
    // 그냥 얘는 징검다리용
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    return (
        <div className="login-page">
            {/* 왼쪽 소개 창 */}
            <IntroSection />
            {/* 오른쪽 로그인 창 */}
            <AuthForm onLogin={onLogin} />
        </div>
    );
};

export default LoginPage;
