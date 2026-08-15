// Shapes for Wallets + wallet transactions (see docs/12 §M21).
import type { WalletTxReason, WalletTxType } from '../../utils/enums';

interface WalletUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface Wallet {
  id: number;
  user_id: number;
  user?: WalletUser;
  balance: string; // decimal-as-string
  created_at: string | null;
  updated_at: string | null;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  user_id: number;
  type: WalletTxType;
  reason: WalletTxReason;
  amount: string;
  balance_before: string;
  balance_after: string;
  note: string | null;
  created_at: string | null;
}

// POST /wallets/{customer_id}/adjust
export interface AdjustWalletInput {
  amount: number; // positive = credit, negative = debit, non-zero
  note?: string;
}
