import { useState } from 'react';
import { Box, HStack, IconButton, Tabs } from '@chakra-ui/react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManageCustomers } from '../../utils/permissions';
import {
  usePersonalCustomers,
  useUpdatePersonalCustomer,
  useDeletePersonalCustomer,
  useCompanyCustomers,
  useUpdateCompanyCustomer,
  useDeleteCompanyCustomer,
} from './api';
import CustomerFormDialog from './CustomerFormDialog';
import type { PersonalCustomer, CompanyCustomer } from './types';

// Customers (see docs/10 §2). Personal = User-shaped, read for admin/super_admin, write
// super_admin only. Company = *meant* to be Company-shaped but a live backend bug means
// name_ar/commercial_reg/etc. come back null (see types.ts) — rendered with `?? '—'`
// fallbacks below. The Company tab is hidden entirely for `admin` — it has no
// `show.company_customers` permission at all, unlike Personal where it can at least read.
export default function CustomersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManageCustomers(user.role) : false;
  const showCompanyTab = user?.role === 'super_admin';

  const [tab, setTab] = useState('personal');

  const personal = usePersonalCustomers();
  const updatePersonal = useUpdatePersonalCustomer();
  const deletePersonal = useDeletePersonalCustomer();

  const company = useCompanyCustomers();
  const updateCompany = useUpdateCompanyCustomer();
  const deleteCompany = useDeleteCompanyCustomer();

  const [editingPersonal, setEditingPersonal] = useState<PersonalCustomer | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyCustomer | null>(null);
  const [toDeletePersonal, setToDeletePersonal] = useState<PersonalCustomer | null>(null);
  const [toDeleteCompany, setToDeleteCompany] = useState<CompanyCustomer | null>(null);

  const personalColumns: Column<PersonalCustomer>[] = [
    { key: 'name', header: t('field.name') },
    { key: 'email', header: t('auth.email') },
    { key: 'phone', header: t('admin.phone'), render: (c) => c.phone ?? '—' },
    { key: 'is_active', header: t('field.status'), render: (c) => <StatusChip status={c.is_active ? 'active' : 'inactive'} /> },
  ];
  if (canWrite) {
    personalColumns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost" onClick={() => setEditingPersonal(c)}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red" onClick={() => setToDeletePersonal(c)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  const companyColumns: Column<CompanyCustomer>[] = [
    { key: 'name_ar', header: t('field.nameAr'), render: (c) => c.name_ar ?? c.name ?? '—' },
    { key: 'commercial_reg', header: t('customers.commercialReg'), render: (c) => c.commercial_reg ?? '—' },
    { key: 'tax_number', header: t('customers.taxNumber'), render: (c) => c.tax_number ?? '—' },
    { key: 'owner', header: t('admin.owner'), render: (c) => c.owner?.email ?? '—' },
    { key: 'status', header: t('field.status'), render: (c) => (c.status ? <StatusChip status={c.status} /> : '—') },
    { key: 'is_active', header: t('customers.accountActive'), render: (c) => <StatusChip status={c.is_active ? 'active' : 'inactive'} /> },
  ];
  if (canWrite) {
    companyColumns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost" onClick={() => setEditingCompany(c)}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red" onClick={() => setToDeleteCompany(c)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader title={t('nav.users')} subtitle={t('customers.hint')} />

      <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value)} variant="line" colorPalette="brand">
        <Tabs.List mb={4} borderColor="line">
          <Tabs.Trigger value="personal">{t('customers.personal')}</Tabs.Trigger>
          {showCompanyTab && <Tabs.Trigger value="company">{t('customers.company')}</Tabs.Trigger>}
        </Tabs.List>

        <Tabs.Content value="personal">
          <DataTable
            columns={personalColumns}
            rows={personal.data ?? []}
            getRowId={(c) => c.id}
            loading={personal.isLoading}
            error={personal.error}
            onRetry={personal.refetch}
            searchKeys={['name', 'email']}
            emptyMessage={t('customers.emptyPersonal')}
          />
        </Tabs.Content>

        {showCompanyTab && (
          <Tabs.Content value="company">
            <DataTable
              columns={companyColumns}
              rows={company.data ?? []}
              getRowId={(c) => c.id}
              loading={company.isLoading}
              error={company.error}
              onRetry={company.refetch}
              emptyMessage={t('customers.emptyCompany')}
            />
          </Tabs.Content>
        )}
      </Tabs.Root>

      <CustomerFormDialog
        open={!!editingPersonal}
        customer={editingPersonal}
        busy={updatePersonal.isPending}
        error={updatePersonal.error}
        onSubmit={(input) =>
          updatePersonal.mutateAsync({ id: editingPersonal!.id, input }).then(() => undefined)
        }
        onClose={() => setEditingPersonal(null)}
      />
      <CustomerFormDialog
        open={!!editingCompany}
        customer={
          editingCompany
            ? { id: editingCompany.id, name: editingCompany.owner?.name ?? editingCompany.name, email: editingCompany.owner?.email ?? '', phone: editingCompany.owner?.phone ?? null, is_active: editingCompany.is_active }
            : null
        }
        busy={updateCompany.isPending}
        error={updateCompany.error}
        onSubmit={(input) =>
          updateCompany.mutateAsync({ id: editingCompany!.id, input }).then(() => undefined)
        }
        onClose={() => setEditingCompany(null)}
      />

      <ConfirmDialog
        open={!!toDeletePersonal}
        title={t('customers.deleteTitle')}
        message={t('catalog.deleteMessage', { name: toDeletePersonal?.name ?? '' })}
        destructive
        loading={deletePersonal.isPending}
        onConfirm={() => { if (toDeletePersonal) deletePersonal.mutate(toDeletePersonal.id, { onSettled: () => setToDeletePersonal(null) }); }}
        onClose={() => setToDeletePersonal(null)}
      />
      <ConfirmDialog
        open={!!toDeleteCompany}
        title={t('customers.deleteTitle')}
        message={t('catalog.deleteMessage', { name: toDeleteCompany?.name_ar ?? toDeleteCompany?.name ?? '' })}
        destructive
        loading={deleteCompany.isPending}
        onConfirm={() => { if (toDeleteCompany) deleteCompany.mutate(toDeleteCompany.id, { onSettled: () => setToDeleteCompany(null) }); }}
        onClose={() => setToDeleteCompany(null)}
      />
    </Box>
  );
}
