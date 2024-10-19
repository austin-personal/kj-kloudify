import React from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import NavBar from './components/NavBar/NavBar';

function App() {
    return (
        <div>
            <AppRoutes />
        </div>
    );
}

// 라우팅과 NavBar 로직을 처리하는 하위 컴포넌트
const AppRoutes: React.FC = () => {
    const location = useLocation();
    // 주소가 LoginPage인지 확인
    const showNavBar = location.pathname !== '/';

    return (
        <>
            {/* 주소가 LoginPage가 아닐경우에만 NavBar 호출 */}
            {showNavBar && <NavBar />}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                {/* 잘못된 주소로 접근할 경우 로그인 페이지로 소환 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
};

export default App;
