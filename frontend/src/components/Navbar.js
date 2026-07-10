import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import '../styles/navbar.css';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar-logo">
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

            {menuOpen && (
                <button
                    type="button"
                    className="navbar-backdrop"
                    onClick={closeMenu}
                    aria-label="Close menu"
                />
            )}

            <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                <li><a href="#features" onClick={closeMenu}>Features</a></li>
                <li><a href="#how-it-works" onClick={closeMenu}>How it works</a></li>
                <li><a href="#testimonials" onClick={closeMenu}>Testimonials</a></li>
            </ul>

            <div className={`navbar-actions ${menuOpen ? 'open' : ''}`}>
                <LanguageSelector variant="navbar" />
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
