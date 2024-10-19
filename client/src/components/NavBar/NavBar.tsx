// src/components/NavBar/NavBar.tsx
import React from 'react';
import './NavBar.css';

const NavBar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        MyLogo
      </div>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  );
};

export default NavBar;