import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CreditCardIcon,
  BookOpenIcon,
  ClipboardListIcon,
  QrcodeIcon,
  MenuAlt2Icon,
  XIcon,
  UserCircleIcon,
  LogoutIcon,
} from "@heroicons/react/outline";
import authenticationService from "../appwrite/auth"; 
import "../styles/sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [username, setUsername] = useState("Guest");
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", icon: HomeIcon, href: "/dashboard" },
    { name: "Budgeting", icon: CreditCardIcon, href: "/budgeting" },
    { name: "Education", icon: BookOpenIcon, href: "/education" },
    { name: "Schemes", icon: ClipboardListIcon, href: "/schemes" },
    { name: "UPI Simulation", icon: QrcodeIcon, href: "/upi_simulation" },
  ];

  // Fetch current user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await authenticationService.getUser();
        if (user) setUsername(user.name); // Assuming `user.name` holds the username
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    fetchUser();
  }, []);

  const handleNavigation = (item, href) => {
    setActiveItem(item);
    navigate(href);
  };

  const handleLogout = async () => {
    try {
      await authenticationService.logout();
      navigate("/signin"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="mobile-header">
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Sidebar">
          {isOpen ? <XIcon className="icon" /> : <MenuAlt2Icon className="icon" />}
        </button>
        <div className="logo-container">
          <img src="/images/SakhiPayLogo.png" width={34} height={34} alt="Sakhi Pay Logo" />
          <span className="logo-text">Sakhi Pay</span>
        </div>
      </div>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <div className="logo-section">
            <img src="/images/SakhiPayLogo.png" className="logo-img" alt="Sakhi Pay Logo" />
            <span className="logo-text">Sakhi Pay</span>
          </div>

          <nav className="navigation">
            <ul>
              {navigation.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.name, item.href)}
                    className={`nav-button ${activeItem === item.name ? "active" : ""}`}
                  >
                    <item.icon className={`nav-icon ${activeItem === item.name ? "active" : ""}`} />
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sidebar-bottom">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
            <div className="user-profile">
              <UserCircleIcon className="user-icon" />
              <div>
                <p className="username"><span>{username}</span></p>
                <a href="#" className="profile-link">View Profile</a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
