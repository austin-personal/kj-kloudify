import React from 'react';
import LoginPage from '../../components/LoginPage/LoginPage';

interface LoginProps {
    setIsLoggedIn: (loggedIn: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
    return <LoginPage setIsLoggedIn={setIsLoggedIn} />;
};

export default Login;