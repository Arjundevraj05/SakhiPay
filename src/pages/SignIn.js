import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../appwrite/auth.js";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import "../styles/Auth.css";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await authService.login({ email: formData.email, password: formData.password });
      alert("Login successful!");
      window.location.href = "/dashboard"; // Redirect to Dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="outer-container">
      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="auth-left">
          <h2>WELCOME BACK!</h2>
          <p>
            Don't have an account? <Link to="/signup" className="link">Sign up</Link>
          </p>

          {/* Login Form */}
          <form onSubmit={handleSignIn}>
            {error && <p className="error-message">{error}</p>}

            {/* Email Input */}
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

            {/* Password Input */}
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

            {/* Remember Me & Forgot Password */}
            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="#" className="forgot-password">Forgot password?</Link>
            </div>

            {/* Sign In Button */}
            <button type="submit" className="auth-button">
              <CheckCircle className="icon" /> Sign In
            </button>

            {/* Social Login */}
            <div className="continue"><p>or continue with</p></div>
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

        {/* Right Side - Illustration */}
        <div className="auth-right">
          <img src="/images/signin.png" alt="Illustration" />
        </div>
      </div>
    </div>
  );
}

export default SignIn;
