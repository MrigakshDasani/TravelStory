import React, { useState } from 'react';
import "./Login.css";
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosinstance from '../../utils/axiosinstance';
import PasswordInput from './PasswordInput';

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false
  });

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation on submit
    setTouched({
      fullName: true,
      email: true,
      password: true
    });

    // Full validation before submission
    if (!fullName.trim()) {
      setError("Full Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid Email format");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    // If we reach here, validation passed
    setError("");
    setIsLoading(true);

    try {
      // Important: Use fullName (camelCase) to match server expectation
      const response = await axiosinstance.post('/create-account', {
        fullName,  // This matches the server's expected parameter name
        email,
        password
      });

      if (response.data && response.data.accesstoken) {
        // Store token and user info
        localStorage.setItem('token', response.data.accesstoken);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        navigate('/'); // Redirect to home
      } else {
        setError("Unexpected response from server");
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Signup failed. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field blur to mark fields as touched
  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true
    });
    
    // Validate on blur
    validateField(field);
  };

  // Validate individual field and set error if needed
  const validateField = (field) => {
    if (field === 'fullName' && touched.fullName && !fullName.trim()) {
      setError("Full Name is required");
      return false;
    }
    
    if (field === 'email' && touched.email) {
      if (!email.trim()) {
        setError("Email is required");
        return false;
      }
      if (!validateEmail(email)) {
        setError("Invalid Email format");
        return false;
      }
    }
    
    if (field === 'password' && touched.password && !password) {
      setError("Password is required");
      return false;
    }
    
    // Clear errors if validation passes
    setError("");
    return true;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left side - Image and text */}
        <div className="login-left">
          <div className="login-left-content">
            <h1 className="login-headline">Capture Your<br />Journeys</h1>
            <p className="login-subtext">
              Record your travel experiences and memories in your personal travel journal.
            </p>
          </div>
        </div>

        {/* Right side - Signup form */}
        <div className="login-right">
          <div className="login-form-container">
            <h2 className="login-title">Create Account</h2>

            <form onSubmit={handleSignup} className="login-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (touched.fullName) validateField('fullName');
                  }}
                  onBlur={() => handleBlur('fullName')}
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder="testuser@timetoprogram.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) validateField('email');
                  }}
                  onBlur={() => handleBlur('email')}
                />
              </div>

              <div className="form-group">
                <PasswordInput
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validateField('password');
                  }}
                  placeholder="testuser@12345"
                  onBlur={() => handleBlur('password')}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "SIGNING UP..." : "SIGN UP"}
              </button>

              <div className="login-divider">
                <span>Or</span>
              </div>

              <button
                type="button"
                className="create-account-button"
                onClick={() => navigate('/login')}
              >
                BACK TO LOGIN
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;