/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext } from 'react';

const DashboardContext = createContext(undefined);

export const DashboardProvider = DashboardContext.Provider;

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboardContext must be used inside DashboardProvider.');
  }

  return context;
};
