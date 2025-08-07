import React, { useState, useEffect } from 'react';

const AlertContext = React.createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'success') => {
    const id = Date.now();
    const alert = { id, message, type };
    setAlerts(prev => [...prev, alert]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <div className="position-fixed" style={{ top: '20px', right: '20px', zIndex: 1050 }}>
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`alert alert-${alert.type} alert-dismissible fade show mb-2`}
            role="alert"
          >
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => removeAlert(alert.id)}
              aria-label="Close"
            />
          </div>
        ))}
      </div>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};