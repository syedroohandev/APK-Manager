import { useState } from 'react';
import axios from 'axios'; // Axios import kiya API hit karne ke liye
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');    
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Button loading state ke liye
  const API = import.meta.env.VITE_API_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🚀 Asli Backend API Request (Auth Login URL)
      const res = await axios.post(`${API}/auth/login`, { 
        email, 
        password 
      });
      
      // Agar backend se success response aata hai
      if (res.data.success) {
        // 🌟 Browser ke localStorage me secure JWT Token, User Role aur EMAIL save kiya
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role); 
        localStorage.setItem('email', email); // 👈 YAHAN USER KA EMAIL BHI SAVE KAR DIYA!
        
        // Parent component (App.jsx) ko notification bheja ke login ho gaya hai
        onLoginSuccess();
      }
    } catch (err) {
      // Agar password galat ho ya server down ho toh error message handle hoga
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Server se connect nahi ho paa raha!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <i className="ti ti-server-2 brand-icon" />
          <h2>Device Manager</h2>
          <p>Sign in to manage APKs and Firmwares</p>
        </div>

        {/* Error message dikhane ke liye condition */}
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Loading state handle ki taaki user baar-baar click na kar sake */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;