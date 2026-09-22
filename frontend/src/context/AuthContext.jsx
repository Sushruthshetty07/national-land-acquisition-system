import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const DEFAULT_USER = {
  id: 'USR-001',
  name: 'Dr. Rajeshwar Sharma',
  email: 'admin@nic.in',
  role: 'SUPER_ADMIN',
  designation: 'Joint Secretary & DG, Land Resources',
  department: 'Ministry of Rural Development, Govt of India',
  state_id: null,
  district_id: null
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        // Fetch personas for quick role switcher
        const res = await api.getPersonas().catch(() => null);
        if (res && res.success) {
          setPersonas(res.personas);
        }

        // If no token exists, log in as default Super Admin
        if (!token) {
          const loginRes = await api.login('admin@nic.in', 'Password@123').catch(() => null);
          if (loginRes && loginRes.success) {
            localStorage.setItem('token', loginRes.token);
            setToken(loginRes.token);
            setUser(loginRes.user);
          }
        } else {
          const profileRes = await api.getProfile().catch(() => null);
          if (profileRes && profileRes.success) {
            setUser(profileRes.user);
          }
        }
      } catch (e) {
        console.warn('Auth init failed:', e);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const switchRole = async (targetRole) => {
    try {
      const res = await api.switchPersona(targetRole);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role, personas, login, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
