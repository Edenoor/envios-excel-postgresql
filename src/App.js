import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Driver from './pages/Driver';
import Seller from './pages/Seller';
import Totales from './pages/Totales';



function App() {
  const role = localStorage.getItem('rol')

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={role === 'admin' ? <Dashboard /> : <Navigate to="/dashboard" />} />
        <Route path="/driver" element={role === 'driver' ? <Driver /> : <Navigate to="/driver" />} />
        <Route path="/seller" element={role === 'seller' ? <Seller /> : <Navigate to="/seller" />} />
        <Route path="/totales" element={role === 'admin' ? <Totales /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;






