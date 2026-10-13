import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getWorkingDate as fetchWorkingDateApi, updateWorkingDate as updateWorkingDateApi } from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [workingDate, setWorkingDate] = useState('');
  const [loading, setLoading] = useState(true);

  const loadWorkingDate = useCallback(async () => {
    try {
      const data = await fetchWorkingDateApi();
      if (data && data.workingDate) {
        setWorkingDate(data.workingDate);
      }
    } catch (err) {
      console.error("Error fetching working date:", err);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user session:", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      loadWorkingDate();
    }
  }, [token, loadWorkingDate]);

  const login = (authToken, userData) => {
    const sessionUser = {
      ownerId: userData.ownerId,
      username: userData.username,
      businessId: userData.businessId,
      businessName: userData.businessName
    };

    setToken(authToken);
    setUser(sessionUser);

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(sessionUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setWorkingDate('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const changeWorkingDate = async (newDate) => {
    try {
      const response = await updateWorkingDateApi(newDate);
      if (response && response.workingDate) {
        setWorkingDate(response.workingDate);
      }
      return response;
    } catch (err) {
      console.error("Error updating working date:", err);
      throw err;
    }
  };

  const value = {
    token,
    user,
    workingDate,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    changeWorkingDate,
    refreshWorkingDate: loadWorkingDate
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
