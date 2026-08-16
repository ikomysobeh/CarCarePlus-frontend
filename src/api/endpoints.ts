// All API paths in one place. Base URL comes from the axios client.
// Mirrors docs/03-api-endpoints.md — ONLY endpoints that exist today.
export const endpoints = {
  auth: {
    registerCustomer: '/auth/register/customer',
    registerCompany: '/auth/register/company',
    registerWorkshop: '/auth/register/workshop',
    login: '/auth/login',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    otpSend: '/auth/password/otp/send',
    otpReset: '/auth/password/otp/reset',
  },
  profile: {
    show: '/profile/showProfile',
    update: '/profile/updateProfile',
  },
  cars: {
    all: '/cars/all',
    indexClient: (customerId?: number) =>
      customerId ? `/cars/indexClient/${customerId}` : '/cars/indexClient',
    store: (customerId?: number) => (customerId ? `/cars/${customerId}` : '/cars'),
    show: (id: number) => `/cars/show/${id}`,
    update: (id: number) => `/cars/update/${id}`,
    destroy: (id: number) => `/cars/delete/${id}`,
  },
  admin: {
    employees: '/admin/employees',
    pendingCompanies: '/admin/registration-requests/companies',
    pendingWorkshops: '/admin/registration-requests/workshops',
    approveCompany: (id: number) => `/admin/registration-requests/companies/${id}/approve`,
    rejectCompany: (id: number) => `/admin/registration-requests/companies/${id}/reject`,
    approveWorkshop: (id: number) => `/admin/registration-requests/workshops/${id}/approve`,
    rejectWorkshop: (id: number) => `/admin/registration-requests/workshops/${id}/reject`,
  },

  // M9: branch-admin account management (super_admin only). No branch_id field yet — see docs/09.
  admins: {
    ...crud('/admins'),
    deactivate: (id: number) => `/admins/${id}/deactivate`,
    activate: (id: number) => `/admins/${id}/activate`,
  },

  // M9: dynamic pricing engine (see docs/09). Same POST-update/DELETE convention as catalog.
  pricingRuleTypes: crud('/pricing-rule-types'),
  pricingRules: crud('/pricing-rules'),
  // Catalog: read = any auth user, write = super_admin only
  categories: crud('/categories'),
  services: crud('/services'),
  subServices: crud('/sub-services'),
  carTypes: crud('/car-types'),
  carBrands: crud('/car-brands'),

  // --- M8: Packages & Points (see docs/08 + docs/PLAN-M8-packages-points.md) ---
  // Packages family follows the same POST-update / DELETE convention as the catalog `crud()`.
  packages: crud('/packages'),
  packageServices: crud('/package-services'),
  packageServiceSubServices: crud('/package-service-sub-services'),

  // User packages = the cars-style pattern: optional customer_id in the URL, and literal
  // /show/ and /update/ segments for the single-record routes.
  userPackages: {
    index: (customerId?: number) =>
      customerId ? `/user-packages/${customerId}` : '/user-packages',
    show: (id: number) => `/user-packages/show/${id}`,
    store: (customerId?: number) =>
      customerId ? `/user-packages/${customerId}` : '/user-packages',
    update: (id: number) => `/user-packages/update/${id}`,
    destroy: (id: number) => `/user-packages/${id}`,
  },

  // Points. `all` and `config` currently 403 until the backend re-runs the seeder;
  // `addTransaction` route is commented out backend-side (see docs/08 §6). Kept for wiring.
  points: {
    all: '/points',
    show: (customerId?: number) =>
      customerId ? `/points/show/${customerId}` : '/points/show',
    transactions: (customerId?: number) =>
      customerId ? `/points/transactions/${customerId}` : '/points/transactions',
    transactionShow: (id: number) => `/points/transactions/show/${id}`,
    addTransaction: '/points/transactions',
  },
  pointsConfig: '/points-configs',

  // --- M10: Branches (see docs/10) ---
  branches: crud('/branches'),

  // --- M11: Customers (see docs/10 §2). No `store` — customers self-register. ---
  customersPersonal: {
    index: '/customers/personal',
    show: (id: number) => `/customers/personal/${id}`,
    update: (id: number) => `/customers/personal/${id}`,
    destroy: (id: number) => `/customers/personal/${id}`,
  },
  customersCompany: {
    index: '/customers/company',
    show: (id: number) => `/customers/company/${id}`,
    update: (id: number) => `/customers/company/${id}`,
    destroy: (id: number) => `/customers/company/${id}`,
  },

  // --- M28: Notifications (backend commit 6b4b477). Read + mark-as-read only; the rows are
  // written server-side by InAppChannel, there is no "create notification" endpoint. ---
  notifications: {
    index: '/notifications',
    unreadCount: '/notifications/unread-count',
    markRead: (id: number) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },

  // --- M12: Workshops (see docs/10 §3) ---
  workshops: {
    ...crud('/workshops'),
    my: '/workshops/my',
    // Unattached `workshop`-role accounts, for the owner dropdown on create. Super admin only.
    ownerCandidates: '/workshops/owner-candidates',
  },

  // --- M13: Materials & Inventory (see docs/10 §5) ---
  materials: crud('/materials'),
  materialUnits: crud('/material-units'),
  inventories: crud('/inventories'),
  // Append-only ledger — no update/destroy endpoints exist.
  inventoryTransactions: {
    index: '/inventory-transactions',
    show: (id: number) => `/inventory-transactions/${id}`,
    store: '/inventory-transactions',
  },

  // --- M14: Settings group (see docs/10 §9) ---
  problemTypes: crud('/problem-types'),
  suggestedProblems: crud('/suggested-problems'),
  systemSettings: crud('/system-settings'),
  aiRules: crud('/ai-rules'),

  // --- M15: Orders/Bookings (see docs/11 §2). Not the crud() shape — no plain `store`
  // (customer-facing booking is a 2-step quote/confirm flow, out of scope here), and the
  // status-transition actions are dedicated endpoints, not a generic update. ---
  bookings: {
    index: '/bookings',
    show: (id: number) => `/bookings/${id}`,
    update: (id: number) => `/bookings/${id}`,
    cancel: (id: number) => `/bookings/${id}`,
    discount: (id: number) => `/bookings/${id}/discount`, // M25: super_admin applies a discount
    assign: (id: number) => `/bookings/${id}/assign`,
    start: (id: number) => `/bookings/${id}/start`,
    complete: (id: number) => `/bookings/${id}/complete`,
    // --- M16: booking detail tabs + service-type details (see docs/12 §M16) ---
    statusHistory: (id: number) => `/bookings/${id}/status-history`,
    priceItems: (id: number) => `/bookings/${id}/price-items`,
    subServices: (id: number) => `/bookings/${id}/sub-services`,
    materials: (id: number) => `/bookings/${id}/materials`,
    maintenanceDetail: (id: number) => `/bookings/${id}/maintenance-detail`,
    roadDetail: (id: number) => `/bookings/${id}/road-detail`,
    towingDetail: (id: number) => `/bookings/${id}/towing-detail`,
  },

  // --- M17: Purchase Requests — branch procurement workflow (see docs/12 §M17) ---
  purchaseRequests: {
    index: '/purchase-requests',
    show: (id: number) => `/purchase-requests/${id}`,
    store: '/purchase-requests',
    update: (id: number) => `/purchase-requests/${id}`,
    destroy: (id: number) => `/purchase-requests/${id}`,
    approve: (id: number) => `/purchase-requests/${id}/approve`,
    reject: (id: number) => `/purchase-requests/${id}/reject`,
    transfer: '/purchase-requests/transfer',
  },
  purchaseRequestItems: {
    index: '/purchase-request-items',
    show: (id: number) => `/purchase-request-items/${id}`,
  },
  // M26: purchase payments — created when a purchase request is approved (super_admin, read-only).
  purchasePayments: {
    index: '/purchase-payments',
    show: (id: number) => `/purchase-payments/${id}`,
  },

  // --- M18: Spare Part Requests (see docs/12 §M18) ---
  sparePartRequests: {
    index: '/spare-part-requests',
    show: (id: number) => `/spare-part-requests/${id}`,
    store: '/spare-part-requests',
    approve: (id: number) => `/spare-part-requests/${id}/approve`,
    reject: (id: number) => `/spare-part-requests/${id}/reject`,
  },

  // --- M19: Payments (see docs/12 §M19) ---
  payments: {
    index: '/payments',
    show: (id: number) => `/payments/${id}`,
    confirmCash: (id: number) => `/payments/${id}/confirm-cash`,
  },

  // --- M20: Ratings (see docs/12 §M20) ---
  ratings: {
    index: '/ratings',
    show: (id: number) => `/ratings/${id}`,
    store: '/ratings',
    update: (id: number) => `/ratings/${id}`,
  },

  // --- M21: Wallets + wallet transactions (see docs/12 §M21) ---
  wallets: {
    index: '/wallets',
    my: '/wallets/my',
    show: (customerId: number) => `/wallets/${customerId}`,
    adjust: (customerId: number) => `/wallets/${customerId}/adjust`,
  },
  walletTransactions: {
    index: (customerId?: number) =>
      customerId ? `/wallet-transactions/${customerId}` : '/wallet-transactions',
    show: (id: number) => `/wallet-transactions/show/${id}`,
  },

  // --- M22: Field ops — employee reports + GPS logs (see docs/12 §M22) ---
  employeeReports: {
    index: '/employee-reports',
    show: (id: number) => `/employee-reports/${id}`,
    store: '/employee-reports',
  },
  gpsLogs: {
    index: '/gps-logs',
    show: (id: number) => `/gps-logs/${id}`,
    store: '/gps-logs',
  },
} as const;

function crud(base: string) {
  return {
    index: base,
    show: (id: number) => `${base}/${id}`,
    store: base,
    update: (id: number) => `${base}/${id}`,
    destroy: (id: number) => `${base}/${id}`,
  };
}
