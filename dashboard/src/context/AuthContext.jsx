import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('staff_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('staff_token');
      const storedUser = localStorage.getItem('staff_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify & refresh profile with backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('staff_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid, logging out staff.');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const loggedUser = res.data.user;

      // Ensure account is staff (doctor or admin)
      if (loggedUser.role !== 'admin' && loggedUser.role !== 'doctor') {
        throw new Error(
          'Access Denied: Patient accounts cannot sign in to the Staff Dashboard. Please use the Patient Portal at http://localhost:5173.'
        );
      }

      setToken(res.data.token);
      setUser(loggedUser);
      localStorage.setItem('staff_token', res.data.token);
      localStorage.setItem('staff_user', JSON.stringify(loggedUser));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_user');
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('staff_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAdmin: user?.role === 'admin',
    isDoctor: user?.role === 'doctor',
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
