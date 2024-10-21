import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import NavBar from './components/NavBar/NavBar';
import Profile from './pages/Profile/Profile';
import History from './pages/History/History';
import { getUserInfo } from './services/authService';

function App() {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        {/* 임시로 profile에다가 가짜정보 넣는중 */}
        {/* <Route path="/profile" element={user ? <Profile user={user} projects={user.projects} /> : <Navigate to="/" />} /> */}
        <Route path="/profile" element={<Profile user={tempUser} projects={tempProjects} />} />

        <Route path="/history" element={<History project={tempProject} />} />

        {/* 주소가 잘못된 경우 싹다 login으로 소환 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;