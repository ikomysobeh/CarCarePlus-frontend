import { useState } from 'react';
import { Box, Button, HStack } from '@chakra-ui/react';
import { MdReceiptLong, MdTune } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canAdjustWallet } from '../../utils/permissions';
import { useWallets } from './api';
import AdjustWalletDialog from './AdjustWalletDialog';
import WalletTransactionsDialog from './WalletTransactionsDialog';
import type { Wallet } from './types';

// Wallets (see docs/12 §M21). List of customer balances; staff can adjust a balance or open
// the per-customer transaction ledger.
export default function WalletsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canAdjust = user ? canAdjustWallet(user.role) : false;

  const { data, isLoading, error, refetch } = useWallets();
  const [adjusting, setAdjusting] = useState<Wallet | null>(null);
  const [viewing, setViewing] = useState<Wallet | null>(null);

  const columns: Column<Wallet>[] = [
    { key: 'user', header: t('wallets.customer'), render: (w) => w.user?.name ?? `#${w.user_id}` },
    { key: 'balance', header: t('wallets.balance'), render: (w) => `${w.balance} ${t('common.sar')}` },
    {
      key: 'updated_at',
      header: t('wallets.updatedAt'),
      render: (w) => (w.updated_at ? new Date(w.updated_at).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (w) => (
        <HStack justify="flex-end" gap={1}>
          <Button size="xs" variant="outline" onClick={() => setViewing(w)}>
            <MdReceiptLong /> {t('wallets.viewTransactions')}
          </Button>
          {canAdjust && (
            <Button size="xs" variant="outline" colorPalette="brand" onClick={() => setAdjusting(w)}>
              <MdTune /> {t('wallets.adjust')}
            </Button>
          )}
        </HStack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title={t('nav.wallets')} subtitle={t('wallets.hint')} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(w) => w.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('wallets.empty')}
      />

      <AdjustWalletDialog open={!!adjusting} wallet={adjusting} onClose={() => setAdjusting(null)} />
      <WalletTransactionsDialog wallet={viewing} onClose={() => setViewing(null)} />
    </Box>
  );
}
