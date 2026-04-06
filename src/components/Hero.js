import React from 'react';
import '../styles/hero.css';


const Hero = () => {
    return (
        <section className="hero">
            {/* Left side: Text content */}
            <div className="hero-content">
                <h1 className='headline'>Empowering Women<br/><span className='highlight'>One Rupee at a Time</span></h1>
                <p className='subline'>
                    Sakhi Pay empowers rural women with<br/>AI-driven budgeting, UPI training, and financial education.
                </p>
                {/* Get Started Button */}
                <button className="cta-button">Get Started</button>
            </div>

            {/* Right side: Cartoon image */}
            <div className="hero-image">
                <img src='/images/SakhiPayHero.png' alt="Empowered Woman Cartoon" />
            </div>
        </section>
    );
};

export default Hero;
