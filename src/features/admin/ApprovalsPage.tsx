import { useState } from 'react';
import { Box, Button, HStack, Tabs } from '@chakra-ui/react';
import { MdCheck, MdClose } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import {
  usePendingCompanies,
  usePendingWorkshops,
  useApproveCompany,
  useRejectCompany,
  useApproveWorkshop,
  useRejectWorkshop,
} from './api';
import RejectReasonDialog from './RejectReasonDialog';
import type { Company, Workshop } from './types';

type Pending = { id: number };

export default function ApprovalsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('companies');

  const companies = usePendingCompanies();
  const workshops = usePendingWorkshops();
  const approveCompany = useApproveCompany();
  const rejectCompany = useRejectCompany();
  const approveWorkshop = useApproveWorkshop();
  const rejectWorkshop = useRejectWorkshop();

  const [toApprove, setToApprove] = useState<Pending | null>(null);
  const [toReject, setToReject] = useState<Pending | null>(null);

  const isCompanies = tab === 'companies';
  const approving = isCompanies ? approveCompany : approveWorkshop;
  const rejecting = isCompanies ? rejectCompany : rejectWorkshop;

  const actions = <T extends Pending>(): Column<T> => ({
    key: 'actions',
    header: '',
    align: 'right',
    render: (row) => (
      <HStack justify="flex-end" gap={2}>
        <Button size="sm" colorPalette="green" variant="subtle" onClick={() => setToApprove(row)}>
          <MdCheck /> {t('admin.approve')}
        </Button>
        <Button size="sm" colorPalette="red" variant="subtle" onClick={() => setToReject(row)}>
          <MdClose /> {t('admin.reject')}
        </Button>
      </HStack>
    ),
  });

  const companyColumns: Column<Company>[] = [
    { key: 'name_ar', header: t('field.nameAr'), render: (c) => c.name_ar || c.name },
    { key: 'commercial_reg', header: t('admin.commercialReg') },
    { key: 'tax_number', header: t('admin.taxNumber') },
    { key: 'owner', header: t('admin.owner'), render: (c) => c.owner?.email ?? '—' },
    { key: 'status', header: t('field.status'), render: (c) => <StatusChip status={c.status} /> },
    actions<Company>(),
  ];

  const workshopColumns: Column<Workshop>[] = [
    { key: 'name_ar', header: t('field.nameAr'), render: (w) => w.name_ar || w.name },
    { key: 'city', header: t('admin.city') },
    { key: 'owner', header: t('admin.owner'), render: (w) => w.owner?.email ?? '—' },
    { key: 'status', header: t('field.status'), render: (w) => <StatusChip status={w.status} /> },
    actions<Workshop>(),
  ];

  return (
    <Box>
      <PageHeader title={t('nav.approvals')} subtitle={t('admin.approvalsHint')} />

      <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value)} variant="line" colorPalette="brand">
        <Tabs.List mb={4} borderColor="line">
          <Tabs.Trigger value="companies">{t('admin.companies')}</Tabs.Trigger>
          <Tabs.Trigger value="workshops">{t('admin.workshops')}</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="companies">
          <DataTable
            columns={companyColumns}
            rows={companies.data ?? []}
            getRowId={(c) => c.id}
            loading={companies.isLoading}
            error={companies.error}
            onRetry={companies.refetch}
            emptyMessage={t('admin.noPendingCompanies')}
          />
        </Tabs.Content>
        <Tabs.Content value="workshops">
          <DataTable
            columns={workshopColumns}
            rows={workshops.data ?? []}
            getRowId={(w) => w.id}
            loading={workshops.isLoading}
            error={workshops.error}
            onRetry={workshops.refetch}
            emptyMessage={t('admin.noPendingWorkshops')}
          />
        </Tabs.Content>
      </Tabs.Root>

      <ConfirmDialog
        open={!!toApprove}
        title={t('admin.approveTitle')}
        message={t('admin.approveMessage')}
        confirmText={t('admin.approve')}
        loading={approving.isPending}
        onConfirm={() => { if (toApprove) approving.mutate(toApprove.id, { onSettled: () => setToApprove(null) }); }}
        onClose={() => setToApprove(null)}
      />
      <RejectReasonDialog
        open={!!toReject}
        title={t('admin.rejectTitle')}
        loading={rejecting.isPending}
        onConfirm={(reason) => { if (toReject) rejecting.mutate({ id: toReject.id, reason }, { onSettled: () => setToReject(null) }); }}
        onClose={() => setToReject(null)}
      />
    </Box>
  );
}
