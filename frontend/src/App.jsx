import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import EmployeesPage from './pages/EmployeesPage';
import ClientsPage from './pages/ClientsPage';
import ClientServicesPage from './pages/ClientServicesPage';
import ClientProductsPage from './pages/ClientProductsPage';
import PaymentsPage from './pages/PaymentsPage';
import CallLogsPage from './pages/CallLogsPage';
import ReportsPage from './pages/ReportsPage';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '18px' }}>Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ marginLeft: '260px' }}>
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/services" element={<ProtectedLayout><ServicesPage /></ProtectedLayout>} />
      <Route path="/departments" element={<ProtectedLayout><DepartmentsPage /></ProtectedLayout>} />
      <Route path="/employees" element={<ProtectedLayout><EmployeesPage /></ProtectedLayout>} />
      <Route path="/clients" element={<ProtectedLayout><ClientsPage /></ProtectedLayout>} />
      <Route path="/client-services" element={<ProtectedLayout><ClientServicesPage /></ProtectedLayout>} />
      <Route path="/client-products" element={<ProtectedLayout><ClientProductsPage /></ProtectedLayout>} />
      <Route path="/payments" element={<ProtectedLayout><PaymentsPage /></ProtectedLayout>} />
      <Route path="/call-logs" element={<ProtectedLayout><CallLogsPage /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
