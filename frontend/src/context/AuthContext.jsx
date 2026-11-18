import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      authService.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(() => {
          authService.logout();
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser({
      email: data.email,
      fullName: data.fullName,
      role: data.role
    });
    return data;
  };

  const register = async (fullName, email, password) => {
    const data = await authService.register(fullName, email, password);
    setUser({
      email: data.email,
      fullName: data.fullName,
      role: data.role
    });
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'Administrator';
  const isCandidate = user?.role === 'Candidate';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isCandidate }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
