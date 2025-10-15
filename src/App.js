import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Budgeting from "./pages/Budgeting";
import Education from "./pages/Education";
import UpiSimulation from "./pages/UpiSimulation";
import Schemes from "./pages/Schemes";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import LandingPage from "./pages/Landing";

const App = () => {
  return (
    <Router>
      <MainRoutes />
    </Router>
  );
};

// Handles conditional layout
  const MainRoutes = () => {
    const location = useLocation();
    const showLayout = ["/dashboard", "/budgeting", "/education", "/upi_simulation", "/schemes"].includes(location.pathname);

    useEffect(() => {
    const scriptId = "google-translate-script";

    // Add script only once
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Define init only once
    window.googleTranslateElementInit = () => {
      // Wait until google.translate exists
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "ta,ml,hi,te", // Tamil, Malayalam, Hindi, Telugu
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      } else {
        console.warn("Google Translate not yet ready. Retrying...");
        setTimeout(window.googleTranslateElementInit, 500);
      }
    };
  }, []);

  return (
    <>

      {showLayout ? (
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/budgeting" element={<Budgeting />} />
            <Route path="/education" element={<Education />} />
            <Route path="/upi_simulation" element={<UpiSimulation />} />
            <Route path="/schemes" element={<Schemes />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      )}
    </>
  );
};

export default App;
