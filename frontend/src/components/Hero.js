import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/hero.css';


const Hero = () => {
    return (
        <section className="hero">
            {/* Left side: Text content */}
            <div className="hero-content">
                <h1 className="headline">
                    <span className="headline-lead">Empowering Women</span>
                    <span className="highlight">One Rupee at a Time</span>
                </h1>
                <p className="subline">
                    Sakhi Pay empowers rural women with AI-driven budgeting, UPI training, and financial education.
                </p>
                {/* Get Started Button */}
                <Link to="/signup" className="cta-button">Get Started</Link>
            </div>

            {/* Right side: Cartoon image */}
            <div className="hero-image">
                <img src='/images/SakhiPayHero.png' alt="Empowered Woman Cartoon" />
            </div>
        </section>
    );
};

export default Hero;
