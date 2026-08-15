import { CloseButton, Dialog, Portal } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DataTable, StatusChip, type Column } from '../../components';
import { useWalletTransactions } from './api';
import type { Wallet, WalletTransaction } from './types';

// Read-only ledger for one customer's wallet. Opened from a row's "Transactions" action.
export default function WalletTransactionsDialog({
  wallet,
  onClose,
}: {
  wallet: Wallet | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useWalletTransactions(wallet?.user_id ?? null);

  const columns: Column<WalletTransaction>[] = [
    { key: 'type', header: t('wallets.type'), render: (tx) => <StatusChip status={tx.type} /> },
    {
      key: 'reason',
      header: t('wallets.reason'),
      render: (tx) => t(`enums.walletTxReason.${tx.reason}`, { defaultValue: tx.reason }),
    },
    { key: 'amount', header: t('wallets.balance'), render: (tx) => `${tx.amount} ${t('common.sar')}` },
    { key: 'balance_after', header: t('wallets.balanceAfter'), render: (tx) => `${tx.balance_after} ${t('common.sar')}` },
    { key: 'note', header: t('wallets.note'), render: (tx) => tx.note || '—' },
    {
      key: 'created_at',
      header: t('wallets.date'),
      render: (tx) => (tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'),
    },
  ];

  return (
    <Dialog.Root open={!!wallet} onOpenChange={(e) => { if (!e.open) onClose(); }} size="xl" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="surface" color="fg" rounded="xl">
            <Dialog.Header>
              <Dialog.Title>
                {t('wallets.transactionsTitle')}
                {wallet?.user ? ` — ${wallet.user.name}` : ''}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <DataTable
                columns={columns}
                rows={data ?? []}
                getRowId={(tx) => tx.id}
                loading={isLoading}
                error={error}
                onRetry={refetch}
                emptyMessage={t('wallets.transactionsEmpty')}
              />
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
