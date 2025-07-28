import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminHome from './pages/HomeAdmin';
import Driver from './pages/Driver';
import Seller from './pages/Seller';
import Totales from './pages/Totales';
import AdminLayout from './Layouts/AdminLayout';

function App() {
  const role = localStorage.getItem('rol');

  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Admin layout: protegemos rutas adentro */}
        <Route path="/admin" element={role === 'admin' ? <AdminLayout /> : <Navigate to="/" replace />}>
          <Route index element={<AdminHome />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="totales" element={<Totales />} />
        </Route>

        {/* Driver */}
        <Route
          path="/driver"
          element={role === 'driver' ? <Driver /> : <Navigate to="/" replace />}
        />

        {/* Seller */}
        <Route
          path="/seller"
          element={role === 'seller' ? <Seller /> : <Navigate to="/" replace />}
        />

        {/* Redirección general */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;







