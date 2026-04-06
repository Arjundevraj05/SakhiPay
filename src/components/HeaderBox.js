'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import authService from '../appwrite/auth.js'; 
import '../styles/headerBox.css';

// Framer Motion animation variants
const textVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const subTextVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: 0.3 },
  },
};

const HeaderBox = () => {
  const [username, setUsername] = useState('User');

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && user.name) {
          setUsername(user.name);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUsername();
  }, []);

  return (
    <div className="header-box-container">
      <motion.div initial="hidden" animate="visible" variants={textVariants}>
        <h1 className="header-title">
          Welcome Back, 
          <span className="gradient-text"> {username}</span>!
        </h1>
        <motion.p initial="hidden" animate="visible" variants={subTextVariants} className="header-subtext">
          Your financial journey is in safe hands. Let's grow and thrive together with <strong>Sakhi Pay</strong>.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default HeaderBox;
