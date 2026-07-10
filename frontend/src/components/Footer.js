import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <h3 className="footer-brand">SakhiPay</h3>
          <p className="footer-tagline">
            Empowering rural women with budgeting, UPI training, and financial education.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <h4 className="footer-nav-title">Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
          </ul>
        </nav>

        <nav className="footer-nav" aria-label="Account links">
          <h4 className="footer-nav-title">Account</h4>
          <ul>
            <li><Link to="/signin">Sign In</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Sakhi Pay. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
