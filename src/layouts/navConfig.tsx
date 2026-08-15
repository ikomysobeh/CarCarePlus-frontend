import type { ReactNode } from 'react';
import {
  MdOutlineDashboard,
  MdOutlineReceiptLong,
  MdOutlineMap,
  MdOutlinePeople,
  MdOutlineStorefront,
  MdOutlineDirectionsCar,
  MdOutlineCategory,
  MdOutlineCardMembership,
  MdOutlineLoyalty,
  MdOutlineInventory2,
  MdOutlineDescription,
  MdOutlinePayments,
  MdOutlineBarChart,
  MdOutlineHowToReg,
  MdOutlineBadge,
  MdOutlineSettings,
  MdOutlinePerson,
  MdOutlineAdminPanelSettings,
  MdOutlinePriceChange,
  MdOutlineCarRepair,
  MdOutlineShoppingCart,
  MdOutlineBuild,
  MdOutlineReceipt,
  MdOutlineStar,
  MdOutlineAccountBalanceWallet,
  MdOutlineAssignment,
} from 'react-icons/md';
import type { ModuleKey } from '../utils/permissions';

// Sidebar entries: route + icon + group. Order & grouping mirror the design reference
// (two labelled sections). Icons are react-icons (Material Design set) — Chakra-friendly.
export type NavGroup = 'main' | 'system';

export interface NavItem {
  key: ModuleKey;
  route: string;
  icon: ReactNode;
  group: NavGroup;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', route: '/', icon: <MdOutlineDashboard />, group: 'main' },
  { key: 'orders', route: '/orders', icon: <MdOutlineReceiptLong />, group: 'main' },
  { key: 'tracking', route: '/tracking', icon: <MdOutlineMap />, group: 'main' },
  { key: 'users', route: '/users', icon: <MdOutlinePeople />, group: 'main' },
  { key: 'branches', route: '/branches', icon: <MdOutlineStorefront />, group: 'main' },
  { key: 'workshops', route: '/workshops', icon: <MdOutlineCarRepair />, group: 'main' },
  { key: 'cars', route: '/cars', icon: <MdOutlineDirectionsCar />, group: 'main' },
  { key: 'catalog', route: '/catalog', icon: <MdOutlineCategory />, group: 'main' },
  { key: 'packages', route: '/packages', icon: <MdOutlineCardMembership />, group: 'main' },
  { key: 'subscriptions', route: '/subscriptions', icon: <MdOutlineLoyalty />, group: 'main' },
  { key: 'inventory', route: '/inventory', icon: <MdOutlineInventory2 />, group: 'main' },
  { key: 'purchaseRequests', route: '/purchase-requests', icon: <MdOutlineShoppingCart />, group: 'main' },
  { key: 'spareParts', route: '/spare-parts', icon: <MdOutlineBuild />, group: 'main' },
  { key: 'payments', route: '/payments', icon: <MdOutlineReceipt />, group: 'main' },
  { key: 'wallets', route: '/wallets', icon: <MdOutlineAccountBalanceWallet />, group: 'main' },
  { key: 'ratings', route: '/ratings', icon: <MdOutlineStar />, group: 'main' },
  { key: 'fieldOps', route: '/field-ops', icon: <MdOutlineAssignment />, group: 'main' },
  { key: 'contracts', route: '/contracts', icon: <MdOutlineDescription />, group: 'main' },
  { key: 'finance', route: '/finance', icon: <MdOutlinePayments />, group: 'main' },
  { key: 'reports', route: '/reports', icon: <MdOutlineBarChart />, group: 'main' },
  { key: 'approvals', route: '/approvals', icon: <MdOutlineHowToReg />, group: 'system' },
  { key: 'staff', route: '/staff', icon: <MdOutlineBadge />, group: 'system' },
  { key: 'admins', route: '/admins', icon: <MdOutlineAdminPanelSettings />, group: 'system' },
  { key: 'pricing', route: '/pricing', icon: <MdOutlinePriceChange />, group: 'system' },
  { key: 'settings', route: '/settings', icon: <MdOutlineSettings />, group: 'system' },
  { key: 'profile', route: '/profile', icon: <MdOutlinePerson />, group: 'system' },
];
