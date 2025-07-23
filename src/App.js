import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Driver from './pages/Driver';
import Seller from './pages/Seller';

const TotalesClientes = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <h2 className="text-3xl text-lime-400 font-bold">📊 Totales por Cliente (Próximamente)</h2>
  </div>
);

const TotalesChoferes = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <h2 className="text-3xl text-lime-400 font-bold">🧾 Totales por Chofer (Próximamente)</h2>
  </div>
);

function App() {
  const role = localStorage.getItem('rol')

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={role === 'admin' ? <Dashboard /> : <Navigate to="/Dashboard" />} />
        <Route path="/driver" element={role === 'driver' ? <Driver /> : <Navigate to="/Driver" />} />
        <Route path="/seller" element={role === 'seller' ? <Seller /> : <Navigate to="/Seller" />} />
      </Routes>
    </Router>
  );
}

export default App;






