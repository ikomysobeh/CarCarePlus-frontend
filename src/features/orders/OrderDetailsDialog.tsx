import { CloseButton, Dialog, Portal, SimpleGrid, Stack, Table, Tabs, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { StatusChip, Loader, EmptyState, ErrorState } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import {
  useOrderStatusHistory,
  useOrderPriceItems,
  useOrderSubServices,
  useOrderMaterials,
} from './api';
import OrderServiceDetails from './OrderServiceDetails';
import type { Order } from './types';

// One label/value cell used across the Overview grid.
function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap={0.5}>
      <Text fontSize="xs" color="fgMuted" textTransform="uppercase" letterSpacing="wide">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="600">
        {children}
      </Text>
    </Stack>
  );
}

function OverviewTab({ order }: { order: Order }) {
  const { t } = useTranslation();
  return (
    <SimpleGrid columns={{ base: 2, md: 3 }} gap={5}>
      <Info label={t('orderDetail.customer')}>{order.customer?.name ?? `#${order.customer_id}`}</Info>
      <Info label={t('orders.car')}>{order.car ? `${order.car.plate_number} · ${order.car.model}` : `#${order.car_id}`}</Info>
      <Info label={t('cars.branch')}>{order.branch?.name_ar ?? (order.branch_id ? `#${order.branch_id}` : '—')}</Info>
      <Info label={t('orderDetail.service')}>{order.service?.name_ar ?? `#${order.service_id}`}</Info>
      <Info label={t('orderDetail.employee')}>{order.employee?.name ?? t('orderDetail.notAssigned')}</Info>
      <Info label={t('field.status')}><StatusChip status={order.status} /></Info>
      <Info label={t('orderDetail.bookingType')}>{order.booking_type ? t('orderDetail.immediate') : t('orderDetail.scheduled')}</Info>
      <Info label={t('orderDetail.vip')}>{order.is_vip ? t('common.yes') : t('common.no')}</Info>
      <Info label={t('orderDetail.total')}>{order.total_price} {t('common.sar')}</Info>
      <Info label={t('orderDetail.discount')}>{order.discount_amount} {t('common.sar')}</Info>
      <Info label={t('orderDetail.createdAt')}>{new Date(order.created_at).toLocaleString()}</Info>
      <Info label={t('orderDetail.notes')}>{order.notes || '—'}</Info>
    </SimpleGrid>
  );
}

function PriceTab({ id }: { id: number }) {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useOrderPriceItems(id);
  if (isLoading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data?.price_items.length) return <EmptyState message={t('orderDetail.emptyPrice')} />;
  return (
    <Table.Root size="sm">
      <Table.Header>
        <Table.Row bg="surfaceAlt">
          <Table.ColumnHeader>{t('orderDetail.label')}</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="end">{t('orderDetail.amount')}</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.price_items.map((it) => (
          <Table.Row key={it.id}>
            <Table.Cell>{it.label}</Table.Cell>
            <Table.Cell textAlign="end">{it.amount}</Table.Cell>
          </Table.Row>
        ))}
        <Table.Row fontWeight="800">
          <Table.Cell>{t('orderDetail.totalItems')}</Table.Cell>
          <Table.Cell textAlign="end">{data.total_items_price} {t('common.sar')}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}

function SubServicesTab({ id }: { id: number }) {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useOrderSubServices(id);
  if (isLoading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data?.sub_services.length) return <EmptyState message={t('orderDetail.emptySubServices')} />;
  return (
    <Table.Root size="sm">
      <Table.Header>
        <Table.Row bg="surfaceAlt">
          <Table.ColumnHeader>{t('orderDetail.subService')}</Table.ColumnHeader>
          <Table.ColumnHeader>{t('orderDetail.price')}</Table.ColumnHeader>
          <Table.ColumnHeader>{t('field.status')}</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.sub_services.map((s) => (
          <Table.Row key={s.id}>
            <Table.Cell>{s.sub_service?.name_ar ?? `#${s.sub_service_id}`}</Table.Cell>
            <Table.Cell>{s.price}</Table.Cell>
            <Table.Cell><StatusChip status={s.status} /></Table.Cell>
          </Table.Row>
        ))}
        <Table.Row fontWeight="800">
          <Table.Cell>{t('orderDetail.total')}</Table.Cell>
          <Table.Cell>{data.total_sub_service_price} {t('common.sar')}</Table.Cell>
          <Table.Cell />
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}

function MaterialsTab({ id }: { id: number }) {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useOrderMaterials(id);
  if (isLoading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data?.materials.length) return <EmptyState message={t('orderDetail.emptyMaterials')} />;
  return (
    <Table.Root size="sm">
      <Table.Header>
        <Table.Row bg="surfaceAlt">
          <Table.ColumnHeader>{t('orderDetail.material')}</Table.ColumnHeader>
          <Table.ColumnHeader>{t('orderDetail.qty')}</Table.ColumnHeader>
          <Table.ColumnHeader>{t('orderDetail.price')}</Table.ColumnHeader>
          <Table.ColumnHeader>{t('field.status')}</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.materials.map((m) => (
          <Table.Row key={m.id}>
            <Table.Cell>{m.material?.name_ar ?? `#${m.material_id}`}</Table.Cell>
            <Table.Cell>{m.quantity}</Table.Cell>
            <Table.Cell>{m.total_price}</Table.Cell>
            <Table.Cell><StatusChip status={m.status} /></Table.Cell>
          </Table.Row>
        ))}
        <Table.Row fontWeight="800">
          <Table.Cell>{t('orderDetail.total')}</Table.Cell>
          <Table.Cell />
          <Table.Cell>{data.total_materials_price} {t('common.sar')}</Table.Cell>
          <Table.Cell />
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}

function HistoryTab({ id }: { id: number }) {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useOrderStatusHistory(id);
  if (isLoading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data?.length) return <EmptyState message={t('orderDetail.emptyHistory')} />;
  return (
    <Table.Root size="sm">
      <Table.Header>
        <Table.Row bg="surfaceAlt">
          <Table.ColumnHeader>{t('orderDetail.from')}</Table.ColumnHeader>
          <Table.ColumnHeader>{t('orderDetail.to')}</Table.ColumnHeader>
          <Table.ColumnHeader>{t('orderDetail.by')}</Table.ColumnHeader>
          <Table.ColumnHeader>{t('orderDetail.at')}</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((h) => (
          <Table.Row key={h.id}>
            <Table.Cell>{h.from_status ? <StatusChip status={h.from_status} /> : '—'}</Table.Cell>
            <Table.Cell><StatusChip status={h.to_status} /></Table.Cell>
            <Table.Cell>{h.employee?.user?.name ?? '—'}</Table.Cell>
            <Table.Cell>{h.created_at ? new Date(h.created_at).toLocaleString() : '—'}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

// Booking detail (see docs/12 §M16). Opened from a row in OrdersPage. The middle read tabs
// are blocked server-side for the workshop role, so we hide them for that role.
export default function OrderDetailsDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isWorkshop = user?.role === 'workshop';

  return (
    <Dialog.Root open={!!order} onOpenChange={(e) => { if (!e.open) onClose(); }} size="xl" placement="center" scrollBehavior="inside">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="surface" color="fg" rounded="xl">
            <Dialog.Header>
              <Dialog.Title>{t('orderDetail.title')} {order ? `#${order.id}` : ''}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {order && (
                <Tabs.Root defaultValue="overview" variant="line" colorPalette="brand">
                  <Tabs.List mb={4} borderColor="line">
                    <Tabs.Trigger value="overview">{t('orderDetail.tabOverview')}</Tabs.Trigger>
                    {!isWorkshop && <Tabs.Trigger value="price">{t('orderDetail.tabPrice')}</Tabs.Trigger>}
                    {!isWorkshop && <Tabs.Trigger value="sub">{t('orderDetail.tabSubServices')}</Tabs.Trigger>}
                    {!isWorkshop && <Tabs.Trigger value="materials">{t('orderDetail.tabMaterials')}</Tabs.Trigger>}
                    {!isWorkshop && <Tabs.Trigger value="history">{t('orderDetail.tabHistory')}</Tabs.Trigger>}
                    <Tabs.Trigger value="service">{t('orderDetail.tabService')}</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="overview"><OverviewTab order={order} /></Tabs.Content>
                  {!isWorkshop && <Tabs.Content value="price"><PriceTab id={order.id} /></Tabs.Content>}
                  {!isWorkshop && <Tabs.Content value="sub"><SubServicesTab id={order.id} /></Tabs.Content>}
                  {!isWorkshop && <Tabs.Content value="materials"><MaterialsTab id={order.id} /></Tabs.Content>}
                  {!isWorkshop && <Tabs.Content value="history"><HistoryTab id={order.id} /></Tabs.Content>}
                  <Tabs.Content value="service"><OrderServiceDetails orderId={order.id} /></Tabs.Content>
                </Tabs.Root>
              )}
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
