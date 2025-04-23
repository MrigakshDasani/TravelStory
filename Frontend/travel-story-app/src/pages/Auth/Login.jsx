import React, { useState } from 'react';
import "./Login.css";
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosinstance from '../../utils/axiosinstance';
import PasswordInput from './PasswordInput';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handlelogin = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!validateEmail(email)) {
      setError("Invalid Email");
      return;
    }
    
    if (!password) {
      setError("Enter valid password");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    // Login API call
    try {
      const response = await axiosinstance.post('/login', { email, password });
      
      // Updated to match server response structure
      if (response.data && response.data.accesstoken) {
        localStorage.setItem('token', response.data.accesstoken);
        // Also store user info if needed
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        navigate('/');  // Navigate to homepage
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Invalid Credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left side - Image and text */}
        <div className="login-left">
          <div className="login-left-content">
            <h1 className="login-headline">Capture Your<br/>Journeys</h1>
            <p className="login-subtext">
              Record your travel experiences and memories in your personal travel journal.
            </p>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="login-right">
          <div className="login-form-container">
            <h2 className="login-title">Login</h2>
            
            <form onSubmit={handlelogin} className="login-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="testuser@timetoprogram.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <PasswordInput 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="testuser@12345"
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                type="submit" 
                className="login-button" 
                disabled={isLoading}
              >
                {isLoading ? "LOGGING IN..." : "LOGIN"}
              </button>
              
              <div className="login-divider">
                <span>Or</span>
              </div>
              
              <button 
                type="button" 
                className="create-account-button"
                onClick={() => navigate('/create-account')}
              >
                CREATE ACCOUNT
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;