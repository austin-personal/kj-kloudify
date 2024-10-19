import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import NavBar from './components/NavBar/NavBar';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <Router>
            <Routes>
                {/* 로그인 화면 */}
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                
                {/* 모든 로그인 후 페이지에 적용될 레이아웃 */}
                <Route path="/*" element={isLoggedIn ? <Layout /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

// 로그인 후 네비게이션 바가 항상 포함된 레이아웃 컴포넌트
const Layout: React.FC = () => {
    return (
        <>
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </>
    );
};

export default App;
