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
    // Check if Google Translate script is already added
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Define the function globally
    window.googleTranslateElementInit = () => {
      if (window.google) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "ta,ml,hi,te", // Tamil, Malayalam, Hindi, Telugu
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      }
    };

    // Wait for the script to load before calling `googleTranslateElementInit`
    const checkGoogle = setInterval(() => {
      if (window.google && window.google.translate) {
        clearInterval(checkGoogle);
        window.googleTranslateElementInit();
      }
    }, 500);

    return () => clearInterval(checkGoogle); // Cleanup on unmount
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
