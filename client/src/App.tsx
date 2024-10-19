import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import NavBar from './components/NavBar/NavBar';
import Profile from './pages/Profile/Profile';
import { getUserInfo } from './services/authService';

function App() {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 토큰이 존재하는지 확인
  // ?????
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  // 주소가 login인지 아닌지
  const showNavBar = location.pathname !== '/';

  useEffect(() => {
    // 유저정보를 가져오는 함수
    const fetchUser = async () => {
      // 토큰이 있다면
      if (token) {
        try {
          // 유저정보 설정
          const userInfo = await getUserInfo(token);
          setUser(userInfo);
        } catch (error) {
          // 에러나면 꺼져!
          setError("유저 인포 못 가져옴!!");
        } finally {
          // 결과발표나면 로딩 끝! 창이 이제 나옵니다!
          setLoading(false);
        }
        // 토큰이 없다면
      } else {
        setLoading(false);
      }
    }

    // 함수 실행
    fetchUser();
  }, [token]);

  // 로딩중 이라면
  if (loading) {
    return <div>Loading...</div>;
  }

  // 에러가 났다면
  if (error) {
    return <div>{error}</div>
  }

  // 임시 유저
  const tempUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    profilePicture: 'https://via.placeholder.com/150'
  };
  // 임시 프로젝트
  const tempProjects = [
    { id: 1, title: 'Project 1', description: 'Description of project 1', createdAt: '2023-01-01' },
    { id: 2, title: 'Project 2', description: 'Description of project 2', createdAt: '2023-02-01' },
    { id: 3, title: 'Project 3', description: 'Description of project 3', createdAt: '2023-03-01' },
  ];

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
        
        {/* 주소가 잘못된 경우 싹다 login으로 소환 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;