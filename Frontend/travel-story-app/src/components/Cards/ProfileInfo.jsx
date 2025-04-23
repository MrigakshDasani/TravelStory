import React, { useState } from 'react';
import './ProfileInfo.css';

const ProfileInfo = ({ userInfo, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Get initials from fullName
  const getInitials = () => {
    if (!userInfo || !userInfo.fullName) return "U";
    return userInfo.fullName.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="profile-container">
      <div 
        className="profile-info" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="profile-avatar">
          {getInitials()}
        </div>
        
        <div className="profile-name">
          <p>{userInfo?.fullName || "User"}</p>
        </div>
      </div>
      
      {showDropdown && (
        <div className="profile-dropdown">
          <button 
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;