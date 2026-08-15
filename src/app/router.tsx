import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { RequireAuth, RequireRole } from '../auth/guards';
import LoginPage from '../auth/pages/LoginPage';
import DashboardHome from '../features/dashboard/DashboardHome';
import CatalogPage from '../features/catalog/CatalogPage';
import PackagesPage from '../features/packages/PackagesPage';
import SubscriptionsPage from '../features/subscriptions/SubscriptionsPage';
import CarsPage from '../features/cars/CarsPage';
import ApprovalsPage from '../features/admin/ApprovalsPage';
import StaffPage from '../features/admin/StaffPage';
import AdminsPage from '../features/admin/AdminsPage';
import PricingPage from '../features/pricing/PricingPage';
import ProfilePage from '../features/profile/ProfilePage';
import BranchesPage from '../features/branches/BranchesPage';
import CustomersPage from '../features/customers/CustomersPage';
import WorkshopsPage from '../features/workshops/WorkshopsPage';
import InventoryPage from '../features/inventory/InventoryPage';
import SettingsPage from '../features/settings/SettingsPage';
import OrdersPage from '../features/orders/OrdersPage';
import PurchaseRequestsPage from '../features/purchase-requests/PurchaseRequestsPage';
import SparePartsPage from '../features/spare-parts/SparePartsPage';
import PaymentsPage from '../features/payments/PaymentsPage';
import RatingsPage from '../features/ratings/RatingsPage';
import WalletsPage from '../features/wallets/WalletsPage';
import FieldOpsPage from '../features/field-ops/FieldOpsPage';
import ComingSoonRoute from '../features/shell/ComingSoonRoute';

// Built pages render their real components; modules whose backend endpoints don't exist
// yet render <ComingSoon/> (see docs/07). Sidebar + guards come from utils/permissions.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      // Built
      { path: 'cars', element: <CarsPage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'packages', element: <PackagesPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'approvals', element: <RequireRole roles={['super_admin']}><ApprovalsPage /></RequireRole> },
      { path: 'staff', element: <RequireRole roles={['super_admin']}><StaffPage /></RequireRole> },
      { path: 'admins', element: <RequireRole roles={['super_admin']}><AdminsPage /></RequireRole> },
      { path: 'pricing', element: <RequireRole roles={['super_admin']}><PricingPage /></RequireRole> },
      { path: 'branches', element: <BranchesPage /> },
      { path: 'users', element: <CustomersPage /> },
      { path: 'workshops', element: <RequireRole roles={['super_admin', 'admin']}><WorkshopsPage /></RequireRole> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      // M17–M22 (see docs/12): SA + admin operations screens.
      { path: 'purchase-requests', element: <PurchaseRequestsPage /> },
      { path: 'spare-parts', element: <SparePartsPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'ratings', element: <RatingsPage /> },
      { path: 'wallets', element: <WalletsPage /> },
      { path: 'field-ops', element: <FieldOpsPage /> },
      // Coming soon (no backend endpoints yet) — each shows a styled ComingSoon page.
      { path: 'tracking', element: <ComingSoonRoute module="tracking" /> },
      { path: 'contracts', element: <ComingSoonRoute module="contracts" /> },
      { path: 'finance', element: <ComingSoonRoute module="finance" /> },
      { path: 'reports', element: <ComingSoonRoute module="reports" /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
