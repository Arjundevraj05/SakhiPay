import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
    useEffect(() => {
        if (!document.getElementById("google-translate-script")) {
            const script = document.createElement("script");
            script.id = "google-translate-script";
            script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        }

        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: "ta,ml,hi,te", // Tamil, Malayalam, Hindi, Telugu
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                    },
                    "google_translate_element"
                );
            }
        };

        const checkGoogle = setInterval(() => {
            if (window.google && window.google.translate) {
                clearInterval(checkGoogle);
                window.googleTranslateElementInit();
            }
        }, 500);

        return () => clearInterval(checkGoogle);
    }, []);

    return (
        <nav className="navbar">
            <div className="logo">
                <img src="/images/SakhiPayLogo.png" alt="Sakhi Pay Logo" className="logo_image" />
                <h1 className="logo_text">SakhiPay</h1>
            </div>
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
            </ul>
            
            {/* Google Translate Dropdown */}
            <div className="translate-dropdown">
                <span className="translate-label">🌍 Language:</span>
                <div id="google_translate_element"></div>
            </div>

            <div>
                <span className="signin"><Link to="/signin">Sign In</Link></span>
                <button className="signup-btn"><Link to="/signup">Sign Up</Link></button> 
            </div>
        </nav>
    );
};

export default Navbar;
