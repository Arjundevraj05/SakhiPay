import React from "react";
import { Bell, Calendar, Lightbulb, Mic, Globe } from "lucide-react";
import "../styles/insights.css"; 

const InsightsPanel = () => {
  return (
    <aside className="insights-panel">
      <div className="insights-header">
        <h1>Insights</h1>
      </div>

      <div className="insight-card">
        <Calendar className="insight-icon due" />
        <div>
          <p className="insight-title">Bill Due</p>
          <p className="insight-text">₹500 in 2 days</p>
        </div>
      </div>

      <div className="insight-card">
        <Bell className="insight-icon alert" />
        <div>
          <p className="insight-title">Spending Alert</p>
          <p className="insight-text">Save ₹200 more!</p>
        </div>
      </div>

    </aside>
  );
};

export default InsightsPanel;
