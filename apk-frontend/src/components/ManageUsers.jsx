import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Edit2, Trash2, Key, Mail, Shield, Lock } from 'lucide-react';
import Toast from './Toast'; 
import './ManageUsers.css'; 

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [editingUserId, setEditingUserId] = useState(null); 

  // 🔐 Security: LocalStorage se current logged-in user ka role check karne ke liye
  const currentLoggedRole = localStorage.getItem('role')?.toLowerCase() || 'manager';
  
  const API = import.meta.env.VITE_API_URL;
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000); 
  };

  const fetchUsers = async () => {
    if (currentLoggedRole !== 'admin') return;

    setLoading(true);
    try {
      const res = await axios.get(`${API}/users`, getAuthConfig());
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch users list', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEmail(user.email);
    setRole(user.role);
    setPassword(''); // Placeholder empty taaki security bani rahe
    setToast(null);
  };

  const resetForm = () => {
    setEditingUserId(null);
    setEmail('');
    setPassword('');
    setRole('admin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUserId) {
        // Explicitly dynamic payload banate hain
        const updateData = { 
          email: email.trim(), 
          role: role 
        };

        // 🌟 Fix: Trim check aur direct validation ko behter banaya
        if (password && password.trim() !== '') {
          updateData.password = password.trim();
        }

        const res = await axios.put(
          `${API}/users/${editingUserId}`,
          updateData,
          getAuthConfig()
        );
        
        if (res.data.success) {
          showToast('User updated successfully', false); 
          resetForm();
          fetchUsers(); 
        }
      } else {
        if (!password || password.trim() === '') {
          return showToast('Password is required for new users', true);
        }
        
        const res = await axios.post(
          `${API}/users`,
          { email: email.trim(), password: password.trim(), role },
          getAuthConfig()
        );
        
        if (res.data.success) {
          showToast('User registered successfully', false); 
          resetForm();
          fetchUsers(); 
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await axios.delete(`${API}/users/${id}`, getAuthConfig());
      if (res.data.success) {
        showToast('User deleted successfully', false); 
        fetchUsers(); 
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', true);
    }
  };

  // 🛡️ SECURITY CHECK: Access Denied Screen
  if (currentLoggedRole !== 'admin') {
    return (
      <div className="access-denied-wrapper">
        <div className="theme-panel-card access-denied-card">
          <div className="lock-icon-container">
            <Lock size={48} className="lock-icon" />
          </div>
          <h2>Access Denied</h2>
          <p>You do not have administrative privileges to view or manage system users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-view-wrapper">
      <div className="users-grid-layout">
        
        {/* LEFT FORM PANEL */}
        <div className="theme-panel-card form-panel">
          <div className="panel-header-block">
            <span className="panel-title-with-icon">
              {editingUserId ? <Edit2 size={18} /> : <UserPlus size={18} />}
              <h3>{editingUserId ? 'Edit User' : 'Add User'}</h3>
            </span>
          </div>
          
          <form onSubmit={handleSubmit} className="theme-form-structure" autoComplete="off">
            <div className="input-field-group">
              <label>Email Address</label>
              <div className="input-with-icon-wrapper">
                <Mail size={16} className="input-inside-icon" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>Password</label>
              <div className="input-with-icon-wrapper">
                <Key size={16} className="input-inside-icon" />
                <input
                  type="password"
                  placeholder={editingUserId ? "Leave blank to keep same" : "Enter password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required={!editingUserId} 
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>Role</label>
              <div className="input-with-icon-wrapper">
                <Shield size={16} className="input-inside-icon" />
                <select value={role} onChange={(e) => setRole(e.target.value)} className="theme-select-dropdown">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <div className="panel-actions-row">
              <button type="submit" className="theme-action-btn primary-solid-btn">
                {editingUserId ? 'Save' : 'Add'}
              </button>
              {editingUserId && (
                <button type="button" className="theme-action-btn secondary-outline-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT DATA SYSTEM TABLE */}
        <div className="theme-panel-card data-panel">
          <div className="panel-header-block">
            <span className="panel-title-with-icon">
              <Users size={18} />
              <h3>Users List</h3>
            </span>
          </div>

          {loading ? (
            <div className="table-loading-state">
              <span className="spinner-indicator">Loading users...</span>
            </div>
          ) : (
            <div className="theme-table-container">
              <table className="dashboard-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="align-center-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="data-row-hover">
                      <td className="uid-cell">{user.id}</td>
                      <td className="email-display-cell">{user.email}</td>
                      <td>
                        <span className={`system-role-badge badge-type-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-buttons-group">
                          <button 
                            className="row-control-btn trigger-edit" 
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button 
                            className="row-control-btn trigger-delete" 
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-table-state">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {toast && (
        <Toast
          message={toast.message}
          isError={toast.isError}
        />
      )}

    </div>
  );
};

export default ManageUsers;