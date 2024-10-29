import React, { useState } from 'react';
import IntroSection from './IntroSection';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    // 로그인 폼인지, 회원가입 폼인지 야바위
    const [isSignup, setIsSignup] = useState(false);

    // 폼 전환 핸들러
    const handleSwitchToSignup = () => setIsSignup(true);
    const handleSwitchToLogin = () => setIsSignup(false);

    return (
        <div className="login-page">
            {/* 왼쪽 소개 폼 */}
            <div className="intro-section">
                <IntroSection />
            </div>
            {/* 오른쪽 폼: 로그인 또는 회원가입 폼을 조건부로 렌더링 */}
            <div className="auth-section">
                {isSignup ? (
                    <SignupForm onSwitchToLogin={handleSwitchToLogin} />
                ) : (
                    <LoginForm onSwitchToSignup={handleSwitchToSignup} />
                )}
            </div>
        </div>
    );
};
export default LoginPage;
