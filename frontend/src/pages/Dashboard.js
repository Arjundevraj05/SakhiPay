import React from "react";
import HeaderBox from '../components/HeaderBox';
import "../styles/dashboard.css";
import FeatureCards from "../components/FeatureCards";

const Dashboard = () => {
  return (
    <>
      {/* Header */}
      <div className="header">
        <HeaderBox />
      </div>

      {/* Hero Section */}
      <div className="hero_dashboard">
        <img src="/images/dashboard.png" alt="dashboard_img" className="dashboard_img" />
        <h1 className="heading_1">
          Empowering <br /><span className="text-orange-600">Financial Freedom</span>
        </h1>
        <p className="heading_2">
          Take control of your finances with Sakhi Pay — track, save, and grow your wealth effortlessly!
        </p>
      </div>

      {/* Balance & Expenditure Cards */}
      <div className="cards-container">
        <FeatureCards/>
      </div>
    </>
  );
};

export default Dashboard;
