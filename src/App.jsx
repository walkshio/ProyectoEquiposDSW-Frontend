import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalogo from './pages/Catalogo';
import Historial from './pages/Historial';
import Aprobaciones from './pages/Aprobaciones';
import Mantenimiento from './pages/Mantenimiento';
import Dashboard from './pages/Dashboard';
import Contrato from './pages/Contrato';

function ProtectedRoute({ children, requiredRol }) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  const user = JSON.parse(userStr);
  if (requiredRol && user.rol !== requiredRol) {
    return <Navigate to="/catalogo" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Register />} />
        
        <Route path="/contrato/:id" element={<Contrato />} />

        <Route 
          path="/catalogo" 
          element={
            <ProtectedRoute>
              <Catalogo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/historial" 
          element={
            <ProtectedRoute>
              <Historial />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRol="Administrador">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aprobaciones" 
          element={
            <ProtectedRoute requiredRol="Administrador">
              <Aprobaciones />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mantenimiento" 
          element={
            <ProtectedRoute requiredRol="Administrador">
              <Mantenimiento />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
