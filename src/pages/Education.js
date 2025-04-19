'use client';
import { useState } from 'react';
import '../styles/education.css';

const videoData = [
  {
    title: 'Budgeting 101: How to Create a Budget That Works',
    description: 'Learn the fundamental steps to create a budget that helps you save and manage your money effectively.',
    category: '💸 Saving & Budgeting',
    url: 'https://www.youtube.com/embed/3pslPbfpnzk?si=-ObZLqvi5Ix-GphD',
  },
  {
    title: 'The Power of Compound Interest Explained',
    description: 'Understand how compound interest works and how it can help your investments grow over time.',
    category: '📈 Investing Basics',
    url: 'https://www.youtube.com/embed/jTW777ENc3c?si=PhedpLa9Zx-vZey8',
  },
  {
    title: 'Understanding Different Types of Loans: Mortgages, Auto Loans, Personal Loans',
    description: 'A comprehensive guide explaining the different types of loans available and their key features.',
    category: '🧾 Understanding Loans',
    url: 'https://www.youtube.com/embed/mzYwYJT-zsU?si=pkbwSOWGS7jlVzHD',
  },
  {
    title: 'Safe Digital Payments: Protecting Yourself Online',
    description: 'Learn essential tips and practices to ensure your digital transactions are secure and avoid online fraud.',
    category: '💳 Digital Payments',
    url: 'https://www.youtube.com/embed/XrFBZK4sqj0?si=-Xy0N6xwt3W0653P',
  },
  {
    title: 'How to Spot and Avoid Common Financial Scams',
    description: 'Learn to identify red flags and protect yourself from prevalent financial scams and frauds.',
    category: '🛡️ Financial Safety & Scams',
    url: 'https://www.youtube.com/embed/2AL_Rjt27VM?si=O3m116OS2zitfGqq',
  },
  {
    title: 'Introduction to the Stock Market for Beginners',
    description: 'A beginner-friendly introduction to the stock market, covering basic concepts and how it works.',
    category: '📈 Investing Basics',
    url: 'https://www.youtube.com/embed/p7HKvqRI_Bo?si=8klbFBWwiPKBHx9m',
  },
  {
    title: 'Saving for Retirement: A Step-by-Step Guide',
    description: 'Learn practical steps and strategies to start planning and saving for a comfortable retirement.',
    category: '💸 Saving & Budgeting',
    url: 'https://www.youtube.com/embed/rdX_fkFFBok?si=lPbt6H1Hjqq_Y-bS',
  },
  {
    title: 'Understanding Credit Scores and How to Improve Them',
    description: 'Learn what credit scores are, why they matter, and actionable steps to improve your creditworthiness.',
    category: '🧾 Understanding Loans',
    url: 'https://www.youtube.com/embed/c0TQlgoUHRE?si=bAk25ZNHzmcDOzNH',
  },
  {
    title: 'Mobile Banking Security Tips You Need to Know',
    description: 'Essential security measures to protect your finances when using mobile banking apps.',
    category: '💳 Digital Payments',
    url: 'https://www.youtube.com/embed/KjeNDjzeHmw?si=XszzurmCoZuF7WGU',
  },
  {
    title: 'Mutual Funds Explained Simply',
    description: 'A clear and concise explanation of what mutual funds are and how they can be part of your investment portfolio.',
    category: '📈 Investing Basics',
    url: 'https://www.youtube.com/embed/VZprdbUZstg?si=-3Ln_AwqT6_LIgn3',
  },
  {
    title: 'Protecting Your Identity: Avoiding Identity Theft',
    description: 'Learn how to safeguard your personal information and prevent identity theft and financial fraud.',
    category: '🛡️ Financial Safety & Scams',
    url: 'https://www.youtube.com/embed/qBDCnKfExw4?si=w5OVZAaZs9Q3dycX',
  },
  {
    title: 'Emergency Fund: Why You Need One and How to Build It',
    description: 'Understand the importance of having an emergency fund and practical tips to build one.',
    category: '💸 Saving & Budgeting',
    url: 'https://www.youtube.com/embed/vO2KGm8NM8E?si=UWTlIcb9T6m58Eqr',
  },
];

const categories = [
  'All',
  '💸 Saving & Budgeting',
  '🧾 Understanding Loans',
  '💳 Digital Payments',
  '📈 Investing Basics',
  '🛡️ Financial Safety & Scams',
];

export default function Education() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVideos = videoData.filter((video) => {
    const matchesCategory =
      selectedCategory === 'All' || video.category === selectedCategory;
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="education_page">
      <div className="education_container">
        <header className="education_styled-header">
          <h2>Financial Literacy Videos</h2>
        </header>

        <div className="education_search-container">
          <input
            type="text"
            className="education_search-box"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="education_category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="video-container">
          {filteredVideos.map((video, index) => (
            <div className="video-card" key={index}>
              <iframe
                src={video.url}
                title={video.title}
                frameBorder="0"
                allowFullScreen
              ></iframe>
              <div className="video-info">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <span className="category-tag">{video.category}</span>
              </div>
            </div>
          ))}
          {filteredVideos.length === 0 && (
            <p className="no-videos">No videos found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
}

