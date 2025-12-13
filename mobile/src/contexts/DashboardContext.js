import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [activeMode, setActiveMode] = useState('workout'); // 'workout' or 'macros'

  return (
    <DashboardContext.Provider value={{ activeMode, setActiveMode }}>
      {children}
    </DashboardContext.Provider>
  );
};

