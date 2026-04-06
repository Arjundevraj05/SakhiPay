import React from "react";
import "../styles/howItWorks.css"; 

const HowItWorks = () => {
  const steps = [
    {
      img: "https://cdn-icons-png.flaticon.com/512/2920/2920277.png",
      title: "Sign Up & Create Profile",
      description: "Register on Sakhi Pay and set up your financial profile.",
    },
    {
      img: "https://cdn-icons-png.flaticon.com/512/4727/4727078.png",
      title: "Learn & Budget Smartly",
      description: "Access AI-driven financial education in your preferred language.",
      highlighted: true,
    },
    {
      img: "https://cdn-icons-png.flaticon.com/512/3211/3211390.png",
      title: "Practice & Manage Transactions",
      description: "Use the UPI simulation to learn secure digital payments.",
    },
  ];

  return (
    <section className="how-it-works">
      <h2 className="section-title">How Sakhi Pay Works</h2>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className={`step-card ${step.highlighted ? "highlighted" : ""}`}>
            <img src={step.img} alt={step.title} className="step-image" />
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
