import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import LoginPage from './pages/Login/Login';
import NavBar from './components/NavBar/NavBar';

function App() {
  const location = useLocation();
  // 토큰이 존재하는지 확인
  const isAuthenticated = !!localStorage.getItem('token');
  // 주소가 LoginPage인지 확인
  const showNavBar = location.pathname !== '/';

  return (
    <Router>
      {/* 주소가 LoginPage가 아닐경우에만 NavBar 호출 */}
      {showNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* 인증이 된 경우에만 Home으로 이동 */}
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} />
        {/* 잘못된 주소로 접근할 경우 로그인 페이지로 소환 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
