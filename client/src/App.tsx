import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import NavBar from './components/NavBar/NavBar';
import Profile from './pages/Profile/Profile';
import History from './pages/History/History';

import Guide from './pages/Guide/Guide';

import { getUserInfo } from './services/authService';

function App() {
  const location = useLocation();

  // 주소가 login인지 아닌지
  const showNavBar = location.pathname !== "/";

  // 임시 유저
  const tempUser = {

    name: "John Doe",
    email: "john.doe@example.com",
    profilePicture: "https://via.placeholder.com/150",
  };
  // 임시 프로젝트들
  const tempProjects = [
    {
      id: 1,
      title: "Project 1",
      description: "Description of project 1",
      createdAt: "2023-01-01",
    },
    {
      id: 2,
      title: "Project 2",
      description: "Description of project 2",
      createdAt: "2023-02-01",
    },
    {
      id: 3,
      title: "Project 3",
      description: "Description of project 3",
      createdAt: "2023-03-01",
    },

  ];

  return (
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> d03895824c52cd65b5c12d3381692c2da45ae0a2
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

        <Route
          path="/profile"
          element={<Profile user={tempUser} projects={tempProjects} />}
        />

        {/* 임시로 history페이지 가는중 */}
        {/* <Route path="/history/:id" element={<History />} /> */}
        <Route path="/history" element={<History />} />

        <Route path="guide" element={<Guide />} />


        {/* 주소가 잘못된 경우 싹다 login으로 소환 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;