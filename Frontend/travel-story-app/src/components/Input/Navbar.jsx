import React from 'react';
import ProfileInfo from '../Cards/ProfileInfo';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/images/logo.png';

import './Navbar.css';

const Navbar = ({ userInfo }) => {
  const isToken = localStorage.getItem("token");
  const navigate = useNavigate();
  
  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img 
            src={logo} 
            alt="Travel Story" 
            className="logo-image" 
            onClick={() => navigate('/')}
          />
          <h1 className="logo-text">Travel Story</h1>
        </div>
        
        {isToken && <ProfileInfo userInfo={userInfo} onLogout={onLogout} />}
      </div>
    </div>
  );
};

export default Navbar;