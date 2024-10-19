import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import NavBar from './components/NavBar/NavBar';

function App() {
  const location = useLocation();
  // 토큰이 존재하는지 확인
  const isAuthenticated = !!localStorage.getItem('token');
  // 주소가 login인지 아닌지
  const showNavBar = location.pathname !== '/';

  return (
    <>
      {/* 주소가 login이면 NavBar 꺼져 */}
      {showNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />

        {/* 나중에 토큰 구현되면 이 코드로 */}
        {/* <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" />} /> */}
        <Route path="/home" element={<Home />} />

        {/* 주소가 잘못된 경우 싹다 login으로 소환 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
