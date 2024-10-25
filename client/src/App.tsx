import React, { useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import NavBar from "./components/NavBar/NavBar";
import Profile from "./pages/Profile/Profile";
import History from "./pages/History/History";
import Review from "./pages/Review/Review";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Guide from "./pages/Guide/Guide";

const App: React.FC = () => {
  const location = useLocation();
  const [projectName, setProjectName] = useState<string>("");
  const [projectCID, setProjectCID] = useState<number>(0);

  // projectName을 업데이트하는 함수
  const handleProjectNameUpdate = (name: string, cid: number) => {
    setProjectName(name);
    setProjectCID(cid);
  };

  // 주소가 login인지 아닌지
  const showNavBar = location.pathname !== "/";

  return (
    <div className="app">
      {/* 주소가 login이면 NavBar 꺼져 */}
      {showNavBar && <NavBar onProjectSubmit={handleProjectNameUpdate} />}
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home projectName={projectName} projectCID={projectCID} />
            </ProtectedRoute>
          }
        />

        {/* 슬아 리뷰페이지 추가 */}
        <Route
          path="/review"
          element={
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
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 임시로 history페이지 가는중 */}
        {/* <Route path="/history/:id" element={<History />} /> */}
        <Route
          path="/history/:pid"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/guide"
          element={
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
};

export default App;
