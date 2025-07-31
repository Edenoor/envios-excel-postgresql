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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          exact
          path="/admin"
          element={
            <AdminLayout /> 
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="totales" element={<Totales />} />
        </Route>

        <Route
          exact
          path="/driver"
          element={
            <Driver /> 
          }
          >
        </Route>

        <Route
          exact
          path="/seller"
          element={
             <Seller /> 
          }
          >
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
