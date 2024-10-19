import React from 'react';
import './NavBar.css';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">MyLogo</div>
            <ul className="navbar-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/guide">Guide</Link></li>
                <li><Link to="/history">History</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/review">Review</Link></li>
            </ul>
        </nav>
    );
};

export default NavBar;
