import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './Context/AppContext';
import { AuthProvider } from './Context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/component/Login';
import Dashboard from './pages/Dashboard/component/Dashboard';
import Products from './pages/Products/component/Products';
import Stock from './pages/Stock/component/Stock';
import Purchase from './pages/Purchase/component/Purchase';
import Sales from './pages/Sales/component/Sales';
import Orders from './pages/Orders/component/Orders';
import Customers from './pages/Customers/component/Customers';
import Reports from './pages/Reports/component/Reports';
import Settings from './pages/Settings/component/Settings';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products/*" element={<Products />} />
                <Route path="stock/*" element={<Stock />} />
                <Route path="purchase/*" element={<Purchase />} />
                <Route path="sales/*" element={<Sales />} />
                <Route path="orders/*" element={<Orders />} />
                <Route path="customers/*" element={<Customers />} />
                <Route path="reports/*" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;