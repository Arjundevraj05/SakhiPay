import React from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { FaWallet, FaMoneyBillWave } from "react-icons/fa";
import "../styles/FeatureCards.css";

const expenseData = [
  { name: "Food", value: 400, color: "#FF8C00" },
  { name: "Transport", value: 300, color: "#00C49F" },
  { name: "Shopping", value: 300, color: "#0088FE" },
  { name: "Others", value: 200, color: "#FFBB28" }
];

const barData = [
  { name: "Jan", expenditure: 3000 },
  { name: "Feb", expenditure: 2500 },
  { name: "Mar", expenditure: 2800 },
  { name: "Apr", expenditure: 3200 },
];

const lineData = [
  { name: "Week 1", balance: 70000 },
  { name: "Week 2", balance: 68000 },
  { name: "Week 3", balance: 65000 },
  { name: "Week 4", balance: 75000 },
];

const FeatureCards = () => {
  return (
    <div className="feature-wrapper">
      <h2 className="feature_heading">Financial Overview</h2>

      <div className="feature-cards">
        <div className="feature-card">
          <div className="inner-content">
            <FaWallet className="feature-icon" />
            <div>
              <h2 className="h2_heading">Balance</h2>
              <p className="amount">₹75,000</p>
            </div>
          </div>
        </div>
        <div className="feature-card">
          <div className="inner-content">
            <FaMoneyBillWave className="feature-icon" />
            <div>
              <h2 className="h2_heading">Expenditure</h2>
              <p className="amount">₹25,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="chart-container-wrapper">
        <div className="bar-chart-container">
          <h2 className="chart-heading">Monthly Expenditure</h2>
          <BarChart width={400} height={250} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="expenditure" fill="#FF8C00" />
          </BarChart>
        </div>

        <div className="line-chart-container">
          <h2 className="chart-heading">Balance Trend</h2>
          <LineChart width={400} height={250} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="balance" stroke="#0088FE" />
          </LineChart>
        </div>

        <div className="chart-container">
          <h2 className="chart-heading">Expense Breakdown</h2>
          <PieChart width={280} height={280}>
            <Pie data={expenseData} dataKey="value" cx="50%" cy="50%" innerRadius={80} outerRadius={120}>
              {expenseData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>

          {/* Expense Key */}
          <div className="expense-key">
            {expenseData.map((entry, index) => (
              <div key={index} className="expense-item">
                <span className="expense-color" style={{ background: entry.color }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCards;
