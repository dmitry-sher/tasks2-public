import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ModalContextProps {
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <ModalContext.Provider value={{ menuVisible, setMenuVisible }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
