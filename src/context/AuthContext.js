import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [rol, setRol] = useState(localStorage.getItem('rol') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null)

  const login = (user) => {
    localStorage.setItem('rol', user.rol);
    setRol(user.rol);
    localStorage.setItem('username', user.username);
    setUsername(user.username);
  };

  const logout = () => {
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    setRol(null);
    setUsername(null)
  };

  return (
    <AuthContext.Provider value={{ rol, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
