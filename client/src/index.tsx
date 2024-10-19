import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.render(
  // App를 Router로 감싸기
    <Router>
        <App />
    </Router>,
    document.getElementById('root')
);