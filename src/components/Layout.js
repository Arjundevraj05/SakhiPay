import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import InsightsPanel from "./InsightsPanel";
import "../styles/layout.css";

const Layout = ({ children }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "9bI09iW5TU3ELsIRKUPRq"; // Replace with your actual Chatbase ID
    script.domain = "www.chatbase.co";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="layout-container">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Right Insights Panel */}
      <InsightsPanel />

      {/* Chatbase Chatbot */}
      <div id="chatbase-chatbot"></div>
    </div>
  );
};

export default Layout;
