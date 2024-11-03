import React, { useState } from "react";
import { Provider } from "react-redux";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import NavBar from "./components/NavBar/NavBar";
import Profile from "./pages/Profile/Profile";
import Detail from "./pages/Detail/Detail";
import Review from "./pages/Review/Review";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Guide from "./pages/Guide/Guide";
import Loading from "./components/Loading/Loading";
import store from "./store/store";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAppSelector } from "./store/hooks";

const App: React.FC = () => {
  const location = useLocation();
  // 주소가 login인지 아닌지
  const showNavBar = location.pathname !== "/";
  const isLoading = useAppSelector((state) => state.loading.isLoading);

  return (
    <>
      {isLoading ? (
        <LoadingOverlay />
      ) : (
        <div className="app">
          {/* 주소가 login이면 NavBar 꺼져 */}
          {showNavBar && <NavBar />}
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              path="/home/:pid"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* 슬아 리뷰페이지 추가 */}
            <Route
              path="/review/:cid"
              element={
                <ProtectedRoute>
                  <Review />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/detail/:pid"
              element={
                <ProtectedRoute>
                  <Detail />
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
      )}
    </>
  );
};

// 전역 로딩 상태에 따라 로딩 컴포넌트를 표시하는 오버레이 컴포넌트
const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <Loading />
    </div>
  );
};

export default App;
