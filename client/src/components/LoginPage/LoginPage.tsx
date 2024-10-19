import React from 'react';
import IntroSection from './IntroSection';
import AuthForm from './AuthForm';
import './LoginPage.css';

interface LoginPageProps {
    setIsLoggedIn: (loggedIn: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsLoggedIn }) => {
    return (
        <div className="login-page">
            <IntroSection />
            <AuthForm setIsLoggedIn={setIsLoggedIn} />
        </div>
    );
};

export default LoginPage;
