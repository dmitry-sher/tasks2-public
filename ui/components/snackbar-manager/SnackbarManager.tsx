import React, {ReactNode, createContext, useContext, useState} from 'react';
import {Snackbar} from 'react-native-paper';

interface SnackbarContextProps {
  showMessage: (message: string, type: 'error' | 'warning' | 'success') => void;
}

interface SnackbarProviderProps {
  children: ReactNode;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined,
);

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'error' | 'warning' | 'success'>('success');

  const showMessage = (
    msg: string,
    msgType: 'error' | 'warning' | 'success',
  ) => {
    setMessage(msg);
    setType(msgType);
    setVisible(true);

    setTimeout(() => {
      setVisible(false);
    }, 5000);
  };

  return (
    <SnackbarContext.Provider value={{showMessage}}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        style={{
          backgroundColor:
            type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'green',
        }}>
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
