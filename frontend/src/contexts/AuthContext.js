import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // You would need to implement this endpoint in your backend
          const response = await api.protected.request('/auth/me');
          setUser(response.user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser({
      cf: userData.cf,
      username: userData.username,
      tipoutente: userData.tipoutente,
      nome: userData.nome,
      cognome: userData.cognome
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.tipoutente === 'admin';
  };

  const isDoctor = () => {
    return user?.tipoutente === 'dottore';
  };

  const isPatient = () => {
    return user?.tipoutente === 'paziente';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout,
        isAdmin,
        isDoctor,
        isPatient
      }}
    >
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