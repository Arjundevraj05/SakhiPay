import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../styles/navbar.css';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

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
                        includedLanguages: "ta,ml,hi,te",
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

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar-top">
                <div className="logo">
                    <img src="/images/SakhiPayLogo.png" alt="Sakhi Pay Logo" className="logo_image" />
                    <h1 className="logo_text">SakhiPay</h1>
                </div>

                <button
                    type="button"
                    className="navbar-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <div className={`navbar-panel ${menuOpen ? 'open' : ''}`}>
                <ul className="nav-links">
                    <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                    <li><a href="#features" onClick={closeMenu}>Features</a></li>
                    <li><a href="#how-it-works" onClick={closeMenu}>How it works</a></li>
                    <li><a href="#testimonials" onClick={closeMenu}>Testimonials</a></li>
                </ul>

                <div className="translate-dropdown">
                    <span className="translate-label">Language</span>
                    <div id="google_translate_element"></div>
                </div>

                <div className="navbar-auth">
                    <span className="signin"><Link to="/signin" onClick={closeMenu}>Sign In</Link></span>
                    <button className="signup-btn" type="button">
                        <Link to="/signup" onClick={closeMenu}>Sign Up</Link>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
