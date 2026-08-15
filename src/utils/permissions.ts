import type { Role } from '../api/types';

// Which navigation modules each role can see. Mirrors docs/04-roles-and-permissions.md.
// The backend is the real gate (403); this only drives the sidebar/route guards.
//
// Built modules have real screens; the rest are "coming soon" shells until the backend
// ships their endpoints (see docs/07). Both appear in the sidebar so the full nav from
// the mockup exists.
export type ModuleKey =
  // built
  | 'dashboard'
  | 'approvals' // company/workshop registration requests (super_admin)
  | 'staff' // create staff accounts (super_admin)
  | 'cars'
  | 'catalog' // categories/services/sub-services/car-types/car-brands
  | 'packages' // M8: subscription packages + package-services + sub-services
  | 'subscriptions' // M8: customer user-packages + loyalty points
  | 'admins' // M9: branch-admin account management (super_admin only)
  | 'pricing' // M9: dynamic pricing rules + rule types (super_admin only)
  | 'branches' // M10: branch CRUD
  | 'users' // M11: customers (personal + company)
  | 'workshops' // M12: workshop CRUD
  | 'inventory' // M13: materials, units, stock, transactions
  | 'settings' // M14: problem types, suggested problems, system settings, AI rules
  | 'purchaseRequests' // M17: branch procurement workflow
  | 'spareParts' // M18: spare part requests
  | 'payments' // M19: payments + confirm cash
  | 'ratings' // M20: customer ratings (read-only in dashboard)
  | 'wallets' // M21: wallets + transactions + adjust
  | 'fieldOps' // M22: employee reports + GPS logs (read-only)
  | 'profile'
  // coming soon (no backend endpoints yet)
  | 'orders'
  | 'tracking'
  | 'contracts'
  | 'finance'
  | 'reports';

// Modules that are actually built today (everything else renders <ComingSoon/>).
export const BUILT_MODULES: ModuleKey[] = [
  'dashboard',
  'approvals',
  'staff',
  'cars',
  'catalog',
  'packages',
  'subscriptions',
  'admins',
  'pricing',
  'branches',
  'users',
  'workshops',
  'inventory',
  'settings',
  'orders', // M15: bookings — see docs/11 §2
  'purchaseRequests', // M17
  'spareParts', // M18
  'payments', // M19
  'ratings', // M20
  'wallets', // M21
  'fieldOps', // M22
  'profile',
];

export const MODULES_BY_ROLE: Record<Role, ModuleKey[]> = {
  super_admin: [
    'dashboard', 'orders', 'tracking', 'users', 'branches', 'workshops', 'cars', 'catalog',
    'packages', 'subscriptions',
    'inventory', 'purchaseRequests', 'spareParts', 'payments', 'wallets', 'ratings', 'fieldOps',
    'contracts', 'finance', 'reports', 'approvals', 'staff', 'admins', 'pricing',
    'settings', 'profile',
  ],
  admin: [
    // 'branches' and 'settings' added in M10/M14 — admin can read+edit-own branch, and read
    // (some write) on the 4 settings-group resources, per docs/10.
    'dashboard', 'orders', 'tracking', 'users', 'branches', 'workshops', 'cars', 'catalog',
    'packages', 'subscriptions',
    'inventory', 'purchaseRequests', 'spareParts', 'payments', 'wallets', 'ratings', 'fieldOps',
    'contracts', 'finance', 'reports', 'settings', 'profile',
  ],
  workshop: ['dashboard', 'orders', 'profile'],
  customer_personal: ['dashboard', 'cars', 'profile'],
  customer_company: ['dashboard', 'cars', 'profile'],
  employee_washer: ['dashboard', 'orders', 'profile'],
  employee_mechanic: ['dashboard', 'orders', 'profile'],
};

// Only super_admin can write to the catalog.
export const canWriteCatalog = (role: Role) => role === 'super_admin';

// Only super_admin can write packages (package/package-service/sub-service). Admins read only.
export const canManagePackages = (role: Role) => role === 'super_admin';

// M10: branch writes — super_admin can touch any branch; an admin may only edit their OWN
// branch (checked per-row in the screen, not here — this only covers the "can write at all").
export const canWriteBranches = (role: Role) => role === 'super_admin' || role === 'admin';

// M11: customers (personal + company) — admin is read-only on BOTH tabs (it lacks
// edit/delete permissions for either resource); only super_admin can write.
export const canManageCustomers = (role: Role) => role === 'super_admin';

// M12: workshops — admin can view but is explicitly blocked from writing server-side
// even though it has `show.workshops`. Only super_admin (or the workshop's own owner,
// out of scope for this admin dashboard) can write.
export const canManageWorkshops = (role: Role) => role === 'super_admin';

// M13: Inventories (stock levels) + Inventory Transactions (the ledger) ONLY — the two
// resources where admin ALSO writes (scoped to their own branch server-side). Material
// Units and Materials in the same feature are super_admin-only writes — use
// `canWriteCatalog` for those two tabs instead, don't reuse this helper there.
export const canManageInventory = (role: Role) => role === 'super_admin' || role === 'admin';

// M14: settings group (problem types, suggested problems, system settings, AI rules) —
// write for super_admin only, same shape as the catalog. Read is now uniform across all 4
// tabs too — admin gained `show.system_settings`/`show.ai_rules` in the 2026-08-06 pull
// (docs/11 §4), so all four tabs are visible to admin, read-only.
export const canManageSettings = (role: Role) => role === 'super_admin';

// M15: bookings (see docs/11 §2). The LIST is already scoped server-side per role (super_admin/
// workshop see everything, admin sees their branch's, employee sees their assigned ones) — these
// helpers only gate the ACTION buttons, matching the backend's per-route `can:` middleware:
// `assign.order`, `edit.order` (start/complete), `cancel.order`. Customers aren't included here —
// they don't have the `orders` module in this admin dashboard at all (see MODULES_BY_ROLE).
export const canAssignOrders = (role: Role) =>
  role === 'super_admin' || role === 'admin' || role === 'workshop';
export const canEditOrderStatus = (role: Role) =>
  role === 'super_admin' ||
  role === 'admin' ||
  role === 'workshop' ||
  role === 'employee_washer' ||
  role === 'employee_mechanic';
export const canCancelOrders = (role: Role) => role === 'super_admin' || role === 'admin';

// M17: Purchase Requests (see docs/12 §M17). Both SA + admin see the list. An ADMIN raises
// requests (create/edit/delete, pending only); the SUPER_ADMIN approves/rejects/transfers.
export const canCreatePurchaseRequest = (role: Role) => role === 'admin';
export const canApprovePurchaseRequest = (role: Role) => role === 'super_admin';

// M19: staff confirm a cash payment was collected.
export const canConfirmCashPayment = (role: Role) => role === 'super_admin' || role === 'admin';

// M21: adjust a customer's wallet balance (staff only).
export const canAdjustWallet = (role: Role) => role === 'super_admin' || role === 'admin';

// M18/M20/M22: spare parts, ratings, field ops are READ-ONLY in this admin dashboard — the
// create/approve flows are customer/employee-facing (their own app). No write helpers here.

export const can = (role: Role, module: ModuleKey) =>
  MODULES_BY_ROLE[role]?.includes(module) ?? false;
