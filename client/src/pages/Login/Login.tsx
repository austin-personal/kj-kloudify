import React from 'react';
import LoginPage from '../../components/LoginPage/LoginPage';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        // 로그인 성공 시 /home으로 이동
        navigate('/home');
    };

    return <LoginPage onLogin={handleLogin} />;
};

export default Login;
