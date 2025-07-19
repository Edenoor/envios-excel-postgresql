import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem('auth') || null);

  const login = (newRole) => {
    localStorage.setItem('auth', newRole);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
