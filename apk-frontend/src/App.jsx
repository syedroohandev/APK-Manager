import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Token verify hone tak blank screen avoid karne ke liye
  const navigate = useNavigate();

  useEffect(() => {
    // Check karein ki browser me valid token pehle se save hai ya nahi
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate("/dashboard"); 
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    navigate("/login"); 
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading System...</div>;
  }

  return (
    <Routes>
      {/* 1. LOGIN ROUTE */}
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />

      {/* 2. DASHBOARD ROUTE (Protected) */}
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* 3. DEFAULT REDIRECT */}
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default App;