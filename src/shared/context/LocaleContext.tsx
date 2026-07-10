'use client';
import { createContext, useContext } from 'react';

const LocaleContext = createContext('en');

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => (
  <LocaleContext.Provider value="en">{children}</LocaleContext.Provider>
);