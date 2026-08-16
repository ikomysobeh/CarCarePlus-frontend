import { useState } from 'react';
import { Box, Button, HStack, IconButton, Tabs } from '@chakra-ui/react';
import { MdAdd, MdSwapHoriz, MdVisibility, MdEdit, MdDelete, MdCheck, MdClose } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canCreatePurchaseRequest, canApprovePurchaseRequest } from '../../utils/permissions';
import {
  usePurchaseRequests,
  useDeletePurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
} from './api';
import PurchaseRequestFormDialog from './PurchaseRequestFormDialog';
import TransferStockDialog from './TransferStockDialog';
import PurchaseRequestDetailsDialog from './PurchaseRequestDetailsDialog';
import RejectPurchaseRequestDialog from './RejectPurchaseRequestDialog';
import PurchasePaymentsSection from './PurchasePaymentsSection';
import type { PurchaseRequest } from './types';

// Purchase Requests (see docs/12 §M17). Admin raises + edits/deletes pending requests;
// super_admin approves/rejects, and can transfer stock directly between branches.
export default function PurchaseRequestsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role;
  const canCreate = role ? canCreatePurchaseRequest(role) : false;
  const canApprove = role ? canApprovePurchaseRequest(role) : false;

  const { data, isLoading, error, refetch } = usePurchaseRequests();
  const del = useDeletePurchaseRequest();
  const approve = useApprovePurchaseRequest();
  const reject = useRejectPurchaseRequest();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseRequest | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [viewing, setViewing] = useState<PurchaseRequest | null>(null);
  const [approving, setApproving] = useState<PurchaseRequest | null>(null);
  const [rejecting, setRejecting] = useState<PurchaseRequest | null>(null);
  const [deleting, setDeleting] = useState<PurchaseRequest | null>(null);

  const columns: Column<PurchaseRequest>[] = [
    { key: 'id', header: t('purchaseRequests.number'), render: (p) => `#${p.id}` },
    { key: 'type', header: t('field.type'), render: (p) => p.request_type },
    {
      key: 'branch',
      header: t('purchaseRequests.branch'),
      render: (p) => p.branch?.name_ar ?? p.from_branch?.name_ar ?? (p.branch_id ? `#${p.branch_id}` : '—'),
    },
    { key: 'items', header: t('purchaseRequests.itemsCount'), render: (p) => String(p.items?.length ?? '—') },
    { key: 'total_amount', header: t('purchaseRequests.total'), render: (p) => `${p.total_amount} ${t('common.sar')}` },
    { key: 'status', header: t('field.status'), render: (p) => <StatusChip status={p.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('purchaseRequests.view')} size="sm" variant="ghost" onClick={() => setViewing(p)}>
            <MdVisibility />
          </IconButton>
          {canApprove && p.status === 'pending' && (
            <>
              <IconButton aria-label={t('purchaseRequests.approve')} size="sm" variant="ghost" colorPalette="green" onClick={() => setApproving(p)}>
                <MdCheck />
              </IconButton>
              <IconButton aria-label={t('purchaseRequests.reject')} size="sm" variant="ghost" colorPalette="red" onClick={() => setRejecting(p)}>
                <MdClose />
              </IconButton>
            </>
          )}
          {canCreate && p.status === 'pending' && (
            <>
              <IconButton aria-label={t('common.edit')} size="sm" variant="ghost" onClick={() => { setEditing(p); setFormOpen(true); }}>
                <MdEdit />
              </IconButton>
              <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red" onClick={() => setDeleting(p)}>
                <MdDelete />
              </IconButton>
            </>
          )}
        </HStack>
      ),
    },
  ];

  return (
    <Tabs.Root defaultValue="requests" variant="line" colorPalette="brand">
      <Tabs.List mb={4} borderColor="line">
        <Tabs.Trigger value="requests">{t('purchaseRequests.tabRequests')}</Tabs.Trigger>
        {canApprove && <Tabs.Trigger value="payments">{t('purchaseRequests.tabPayments')}</Tabs.Trigger>}
      </Tabs.List>
      <Tabs.Content value="requests">
        <Box>
      <PageHeader
        title={t('nav.purchaseRequests')}
        subtitle={t('purchaseRequests.hint')}
        action={
          <HStack gap={2}>
            {canApprove && (
              <Button variant="outline" onClick={() => setTransferOpen(true)}>
                <MdSwapHoriz /> {t('purchaseRequests.transfer')}
              </Button>
            )}
            {canCreate && (
              <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
                <MdAdd /> {t('purchaseRequests.add')}
              </Button>
            )}
          </HStack>
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(p) => p.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('purchaseRequests.empty')}
      />

      <PurchaseRequestFormDialog open={formOpen} request={editing} onClose={() => setFormOpen(false)} />
      <TransferStockDialog open={transferOpen} onClose={() => setTransferOpen(false)} />
      <PurchaseRequestDetailsDialog request={viewing} onClose={() => setViewing(null)} />

      <ConfirmDialog
        open={!!approving}
        title={t('purchaseRequests.approveTitle')}
        message={t('purchaseRequests.approveMessage')}
        loading={approve.isPending}
        onConfirm={() => { if (approving) approve.mutate(approving.id, { onSettled: () => setApproving(null) }); }}
        onClose={() => setApproving(null)}
      />
      <RejectPurchaseRequestDialog
        open={!!rejecting}
        loading={reject.isPending}
        onConfirm={(reason) => {
          if (rejecting) reject.mutate({ id: rejecting.id, rejection_reason: reason }, { onSettled: () => setRejecting(null) });
        }}
        onClose={() => setRejecting(null)}
      />
      <ConfirmDialog
        open={!!deleting}
        title={t('purchaseRequests.deleteTitle')}
        message={t('purchaseRequests.deleteMessage')}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (deleting) del.mutate(deleting.id, { onSettled: () => setDeleting(null) }); }}
        onClose={() => setDeleting(null)}
      />
        </Box>
      </Tabs.Content>
      {canApprove && (
        <Tabs.Content value="payments">
          <PurchasePaymentsSection />
        </Tabs.Content>
      )}
    </Tabs.Root>
  );
}
