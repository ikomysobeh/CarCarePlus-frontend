import { useMemo, useState } from 'react';
import { Avatar, Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { useCarBrands } from '../catalog/api';
import { useCars, useDeleteCar } from './api';
import CarFormDialog from './CarFormDialog';
import type { Car } from './types';

export default function CarsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user?.role === 'super_admin' || user?.role === 'admin';
  const canDelete = user?.role === 'super_admin';

  const { data, isLoading, error, refetch } = useCars();
  const brands = useCarBrands();
  const del = useDeleteCar();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);
  const [toDelete, setToDelete] = useState<Car | null>(null);

  const brandName = useMemo(() => {
    const map = new Map(brands.data?.map((b) => [b.id, b.name]));
    return (id: number) => map.get(id) ?? `#${id}`;
  }, [brands.data]);

  const columns: Column<Car>[] = [
    {
      key: 'image_url',
      header: '',
      render: (c) => (
        <Avatar.Root shape="rounded" size="sm">
          <Avatar.Image src={c.image_url ?? undefined} />
          <Avatar.Fallback>{c.model?.[0] ?? '?'}</Avatar.Fallback>
        </Avatar.Root>
      ),
    },
    { key: 'plate_number', header: t('cars.plateNumber') },
    { key: 'model', header: t('cars.model') },
    { key: 'brand_id', header: t('cars.brand'), render: (c) => brandName(c.brand_id) },
    { key: 'car_type', header: t('cars.carType'), render: (c) => c.car_type?.name_ar ?? '—' },
    { key: 'branch', header: t('cars.branch'), render: (c) => c.branch?.name_ar ?? '—' },
    { key: 'owner', header: t('cars.owner'), render: (c) => c.owner?.name ?? `#${c.user_id}` },
    { key: 'fuel_type', header: t('cars.fuelType'), render: (c) => t(`enums.fuel.${c.fuel_type}`) },
    {
      key: 'is_active',
      header: t('field.status'),
      render: (c) => <StatusChip status={c.is_active ? 'active' : 'inactive'} />,
    },
  ];

  if (canWrite || canDelete) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <HStack justify="flex-end" gap={1}>
          {canWrite && (
            <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
              onClick={() => { setEditing(c); setFormOpen(true); }}>
              <MdEdit />
            </IconButton>
          )}
          {canDelete && (
            <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
              onClick={() => setToDelete(c)}>
              <MdDelete />
            </IconButton>
          )}
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('nav.cars')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('cars.add')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(c) => c.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['plate_number', 'model', 'color']}
        emptyMessage={t('cars.empty')}
      />
      <CarFormDialog open={formOpen} car={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('cars.deleteTitle')}
        message={t('cars.deleteMessage', { plate: toDelete?.plate_number ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
