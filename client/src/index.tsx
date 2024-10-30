import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!); // '!'는 null이 아님을 명시
//ResizeObserver 감지하는 strictmode 끔 . 배포시에는 다시 켜서 배포해야함
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
  // </React.StrictMode>
);
