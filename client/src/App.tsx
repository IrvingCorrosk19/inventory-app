// @ts-ignore
import { Routes, Route, Navigate } from 'react-router-dom';
// @ts-ignore
import Products from './pages/Products';
// @ts-ignore
import Inventory from './pages/Inventory';
// @ts-ignore
import Suppliers from './pages/Suppliers';
// @ts-ignore
import Categories from './pages/Categories';
// @ts-ignore
import Users from './pages/Users';
// @ts-ignore
import Dashboard from './pages/Dashboard';
// @ts-ignore
import Login from './pages/Login';
// @ts-ignore
import Layout from './components/layout/Layout';
// @ts-ignore
import Reports from './pages/Reports';
// @ts-ignore
import BarcodeManager from './pages/BarcodeManager';
import React from 'react';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="categories" element={<Categories />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
        <Route path="barcode-manager" element={<BarcodeManager />} />
      </Route>
    </Routes>
  );
}

export default App;
