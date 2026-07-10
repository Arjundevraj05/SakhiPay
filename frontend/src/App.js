import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import PublicRoute from "./components/PublicRoute";
import Dashboard from "./pages/Dashboard";
import Budgeting from "./pages/Budgeting";
import Education from "./pages/Education";
import UpiSimulation from "./pages/UpiSimulation";
import Schemes from "./pages/Schemes";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import LandingPage from "./pages/Landing";
import EMI from "./pages/EMI";

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
    const showLayout = ["/dashboard", "/budgeting", "/education", "/upi_simulation", "/schemes", "/emi"].includes(location.pathname);

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
            <Route path="/emi" element={<EMI />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};

export default App;