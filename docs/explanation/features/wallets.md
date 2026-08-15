# Feature: Wallets (M21)

Customer wallet balances. Staff can **adjust** a balance (credit or debit, with a note) and open
a per-customer **transaction ledger**.

Backend contract: `car project/docs/12-bookings-detail-procurement-2026-08-15.md` §M21.

## Files

| File | What it does |
|---|---|
| `types.ts` | `Wallet`, `WalletTransaction`, and the `AdjustWalletInput` shape |
| `api.ts` | `useWallets()`, `useWalletTransactions(customerId)`, `useAdjustWallet()` |
| `AdjustWalletDialog.tsx` | signed-amount + note form (positive = credit, negative = debit) |
| `WalletTransactionsDialog.tsx` | a dialog that lists one customer's transactions |
| `WalletsPage.tsx` | the balances table + the two dialogs |

## Key idea: a query that only runs when needed (`enabled`)

We don't want to fetch every customer's transactions up front. `useWalletTransactions` passes
`enabled: customerId != null` to React Query — the request only fires once a customer is selected
(the transactions dialog opens). Think of it as a lazy relation load instead of eager `with()`.

```ts
useQuery({ queryKey: [...], enabled: customerId != null, queryFn: … });
```

## Key idea: signed amount

There's no separate "credit/debit" toggle — the sign of `amount` decides (matches the backend's
`AdjustWalletRequest`). The zod schema just requires a non-zero number. On success we invalidate
both the wallets list and that customer's transactions so both refresh.

## When you'll touch this file

- A "top up" vs "deduct" UI is preferred over a signed field → split into two buttons that set the sign.
- Server pagination on transactions → wire it into `useWalletTransactions`.
