import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!); // '!'는 null이 아님을 명시
//ResizeObserver 감지하는 strictmode 끔 . 배포시에는 다시 켜서 배포해야함
root.render(
  // <React.StrictMode>
  <Router>
    <App />
  </Router>
  // </React.StrictMode>
);
