import { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ onNav, onLogout }) => {
  const [active, setActive] = useState('all');
  const [userEmail, setUserEmail] = useState('Admin'); 
  const [userRole, setUserRole] = useState('admin'); // Default backup role lower case me

  useEffect(() => {
    const savedEmail = localStorage.getItem('email'); 
    const savedRole = localStorage.getItem('role'); 
    
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
    if (savedRole) {
      setUserRole(savedRole.toLowerCase()); // Case sensitivity se bachne ke liye lowercase kiya
    }
  }, []);

  const nav = (key) => {
    setActive(key);
    onNav(key);
  };

  return (
    <aside className="sidebar">
      <div className="sb-header">
        <div className="sb-brand">
          <i className="ti ti-server-2" />
          Device Manager
        </div>
      </div>

      <nav className="sb-nav">
        {/* APK MANAGEMENT */}
        <div className="sb-section">APK Management</div>

        <button
          className={`sb-item ${active === 'all' ? 'active' : ''}`}
          onClick={() => nav('all')}
        >
          <i className="ti ti-layout-grid" />
          All APKs
        </button>

        <button
          className={`sb-item ${active === 'recent' ? 'active' : ''}`}
          onClick={() => nav('recent')}
        >
          <i className="ti ti-clock" />
          Recently Added
        </button>

        {/* WS-11 CONFIGURATION */}
        <div className="sb-section">WS-11 Configuration</div>

        <button
          className={`sb-item ${active === 'ws11-firmware' ? 'active' : ''}`}
          onClick={() => nav('ws11-firmware')}
        >
          <i className="ti ti-cpu" />
          Firmware
        </button>

        {/* 🌟 SYSTEM SECURITY SECTION - Sirf ADMIN ko dikhega */}
        {userRole === 'admin' && (
          <>
            <div className="sb-section">System Security</div>
            <button
              className={`sb-item ${active === 'manage-users' ? 'active' : ''}`}
              onClick={() => nav('manage-users')}
            >
              <i className="ti ti-users" />
              Manage Users
            </button>
          </>
        )}
      </nav>

      <div className="sb-footer">
        <div className="sb-user-card">
          <div className="sb-user-avatar">
            <i className="ti ti-user" />
          </div>
          <div className="sb-user-info">
            <span className="sb-username">{userEmail.split('@')[0]}</span>
            <span className="sb-user-role" style={{ textTransform: 'capitalize' }}>
              {userRole}
            </span>
          </div>
        </div>
        
        <button className="sb-logout-btn" onClick={onLogout}>
          <i className="ti ti-logout" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;