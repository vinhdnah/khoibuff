import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Storefront Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ServicesPage } from './pages/ServicesPage';
import { NewOrderPage } from './pages/NewOrderPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { WalletPage } from './pages/WalletPage';
import { AccountPage } from './pages/AccountPage';
import { TicketsPage } from './pages/TicketsPage';

// Admin Suite Pages (Isolated at /admin/*)
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDepositsPage } from './pages/admin/AdminDepositsPage';
import { AdminTicketsPage } from './pages/admin/AdminTicketsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { useSepayAutoSync } from './hooks/useSepayAutoSync';
import { useAuthStore } from './stores/authStore';

function GlobalAppInit() {
  useSepayAutoSync();
  const { checkSession } = useAuthStore();

  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  return null;
}

export function App() {
  return (
    <ToastProvider>
      <GlobalAppInit />
      <BrowserRouter>
        <Routes>
          {/* Public Landing Storefront */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Auth Page */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Customer Storefront & Management (Web Con) */}
          <Route element={<CustomerLayout />}>
            {/* Public Service Catalog */}
            <Route path="/services" element={<ServicesPage />} />

            {/* Protected Customer Routes - Must be logged in */}
            <Route
              path="/order"
              element={
                <ProtectedRoute>
                  <NewOrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <TicketsPage />
                </ProtectedRoute>
              }
            />

            {/* Redirects for legacy routes */}
            <Route path="/deposit" element={<Navigate to="/wallet" replace />} />
            <Route path="/transactions" element={<Navigate to="/wallet" replace />} />
            <Route path="/dashboard" element={<Navigate to="/order" replace />} />
            <Route path="/order/new" element={<Navigate to="/order" replace />} />
            <Route path="/tickets" element={<Navigate to="/support" replace />} />
            <Route path="/settings" element={<Navigate to="/account" replace />} />
          </Route>

          {/* Admin Control Panel (Secured at /admin/* - Requires Admin Role) */}
          <Route
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/deposits" element={<AdminDepositsPage />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/logs" element={<AdminLogsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
