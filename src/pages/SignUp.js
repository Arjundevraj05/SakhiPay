"use client";

import { useState } from "react";
import authService from "../appwrite/auth.js";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, CheckCircle } from "lucide-react";
import "../styles/Auth.css";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await authService.createAccount(formData);
      alert("Signup successful! You are now logged in.");
      window.location.href = "/dashboard"; // Redirect to Dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="outer-container">
      <div className="auth-container">
        {/* Left Section */}
        <div className="auth-left">
          <h2>CREATE AN ACCOUNT</h2>
          <p>
            Already have an account? <Link to="/signin" className="link">Sign in</Link>
          </p>

          {/* Form Section */}
          <form onSubmit={handleSignup}>
            {error && <p className="error-message">{error}</p>}

            {/* Username Field */}
            <label>Username</label>
            <div className="input-wrapper">
              <User className="icon" />
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your username" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Email Field */}
            <label>Email</label>
            <div className="input-wrapper">
              <Mail className="icon" />
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Password Field */}
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="●●●●●●" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
              </span>
            </div>

            {/* Submit Button */}
            <button type="submit" className="auth-button">
              <CheckCircle className="icon" /> Sign Up
            </button>

            <div className="continue"><p>or continue with</p></div>

            {/* Social Login */}
            <div className="social-login">
              <div className="social-icons">
                <a href="#" className="social-icon">
                  <img src="/images/google.png" alt="Google" />
                </a>
                <a href="#" className="social-icon">
                  <img src="/images/facebook.png" alt="Facebook" />
                </a>
                <a href="#" className="social-icon">
                  <img src="/images/apple.png" alt="Apple" />
                </a>
              </div>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="auth-divider"></div>

        {/* Right Section */}
        <div className="auth-right">
          <img src="/images/signup.png" alt="Illustration" />
        </div>
      </div>
    </div>
  );
}

export default SignUp;
