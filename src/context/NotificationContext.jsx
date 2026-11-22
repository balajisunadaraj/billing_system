import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [modal, setModal] = useState(null); // { title, message, details, type: 'success' | 'info' | 'error' }
  const [toasts, setToasts] = useState([]); // Array of { id, type, title, message }

  const showPopup = useCallback(({ title, message, details = '', type = 'success', actionLabel = 'Done', onAction = null }) => {
    setModal({
      title,
      message,
      details,
      type,
      actionLabel,
      onAction
    });
  }, []);

  const closePopup = useCallback(() => {
    setModal(null);
  }, []);

  const showToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showPopup, closePopup, showToast, modal, toasts, removeToast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
