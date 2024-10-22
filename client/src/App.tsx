import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import NavBar from "./components/NavBar/NavBar";
import Profile from "./pages/Profile/Profile";
import History from "./pages/History/History";
import Review from "./pages/Review/Review";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import Guide from "./pages/Guide/Guide";

const App: React.FC = () => {
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

    <div className="app">
      {/* 주소가 login이면 NavBar 꺼져 */}
      {showNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
        />

        {/* 슬아 리뷰페이지 추가 */}
        <Route path="/review" element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
        />
        {/* 임시로 profile에다가 가짜정보 넣는중 */}
        {/* <Route path="/profile" element={user ? <Profile user={user} projects={user.projects} /> : <Navigate to="/" />} /> */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile user={tempUser} projects={tempProjects} />
            </ProtectedRoute>
          }
        />

        {/* 임시로 history페이지 가는중 */}
        {/* <Route path="/history/:id" element={<History />} /> */}
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
        />

        <Route path="/guide" element={
          <ProtectedRoute>
            <Guide />
          </ProtectedRoute>
        }
        />

        {/* 주소가 잘못된 경우 싹다 login으로 소환 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
