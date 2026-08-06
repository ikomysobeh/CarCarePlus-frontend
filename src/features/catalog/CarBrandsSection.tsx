import { useState } from 'react';
import { Avatar, Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canWriteCatalog } from '../../utils/permissions';
import { useCarBrands, useDeleteCarBrand } from './api';
import CarBrandFormDialog from './CarBrandFormDialog';
import type { CarBrand } from './types';

const apiOrigin = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/api\/?$/, '');
const logoUrl = (logo: string | null) =>
  !logo ? undefined : /^https?:\/\//.test(logo) ? logo : `${apiOrigin}/storage/${logo}`;

export default function CarBrandsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canWriteCatalog(user.role) : false;

  const { data, isLoading, error, refetch } = useCarBrands();
  const del = useDeleteCarBrand();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CarBrand | null>(null);
  const [toDelete, setToDelete] = useState<CarBrand | null>(null);

  const columns: Column<CarBrand>[] = [
    {
      key: 'logo',
      header: t('field.logo'),
      render: (b) => (
        <Avatar.Root shape="rounded" size="sm">
          <Avatar.Image src={logoUrl(b.logo)} />
          <Avatar.Fallback>{b.name[0]}</Avatar.Fallback>
        </Avatar.Root>
      ),
    },
    { key: 'name', header: t('field.name') },
    {
      key: 'is_active',
      header: t('field.status'),
      render: (b) => <StatusChip status={b.is_active ? 'active' : 'inactive'} />,
    },
  ];

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(b); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(b)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('catalog.carBrands')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('catalog.addCarBrand')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(b) => b.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name']}
        emptyMessage={t('catalog.emptyCarBrands')}
      />
      <CarBrandFormDialog open={formOpen} carBrand={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('catalog.deleteCarBrandTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
