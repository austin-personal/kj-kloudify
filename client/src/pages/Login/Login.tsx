import React from 'react';
import './Login.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../Home/Home'

function Login() {
    return (
        <div>
            <Router>
                <button></button>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </Router>
        </div>
    );
}

export default Login;