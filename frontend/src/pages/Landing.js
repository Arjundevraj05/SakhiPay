import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import '../styles/landing.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Landing = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000, 
            once: true, 
            easing: 'ease-in-out',
        });
    }, []);

    return (
        <div className="landing-page">
            <Navbar />
            <section id="hero" data-aos="fade-up"><Hero /></section>
            <section data-aos="fade-up"><Stats /></section>
            <section id="features" data-aos="fade-up"><Features /></section>
            <section id="how-it-works" data-aos="fade-up"><HowItWorks /></section>
            <section id="testimonials" data-aos="fade-up"><Testimonials /></section>
            <Footer />
        </div>
    );
};

export default Landing;
