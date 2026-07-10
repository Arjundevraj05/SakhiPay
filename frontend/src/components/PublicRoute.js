import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import authService from "../appwrite/auth.js";

function PublicRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    authService
      .getCurrentUser()
      .then((user) => {
        if (mounted) {
          setIsLoggedIn(Boolean(user));
          setChecking(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsLoggedIn(false);
          setChecking(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return null;
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
