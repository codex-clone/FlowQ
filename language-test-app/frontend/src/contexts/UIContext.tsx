import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { toast, ToastOptions } from 'react-toastify';

interface UIContextValue {
  isGlobalLoading: boolean;
  setGlobalLoading: (state: boolean) => void;
  notify: (message: string, options?: ToastOptions) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const value = useMemo(
    () => ({
      isGlobalLoading,
      setGlobalLoading: setIsGlobalLoading,
      notify: (message: string, options?: ToastOptions) => toast(message, options)
    }),
    [isGlobalLoading]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};
