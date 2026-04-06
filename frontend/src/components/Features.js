import React from 'react';
import '../styles/features.css';
import { BiBook, BiBulb, BiShield } from 'react-icons/bi';

const Features = () => {
    return (
        <section className="features">
            <div className="features-content">
                <h2>We Provide Many Features You Can Use</h2>
                <p>You can explore the features that we provide with fun and have their own functions each feature</p>
                <ul>
                    <li><BiBook className="feature-icon" /> Financial Education</li>
                    <li><BiBulb className="feature-icon" /> Smart Budgeting</li>
                    <li><BiShield className="feature-icon" /> Secure UPI Training</li>
                </ul>
            </div>
            
            <div className="features-image">
                <img src="/images/features_img.png" alt="Features" />
            </div>
        </section>
    );
};

export default Features;
