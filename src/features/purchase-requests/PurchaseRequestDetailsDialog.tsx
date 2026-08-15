import { CloseButton, Dialog, Portal, Stack, Table, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { StatusChip } from '../../components';
import type { PurchaseRequest } from './types';

// Read-only view of a purchase request's line items + meta. Items are eager-loaded on show.
export default function PurchaseRequestDetailsDialog({
  request,
  onClose,
}: {
  request: PurchaseRequest | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Dialog.Root open={!!request} onOpenChange={(e) => { if (!e.open) onClose(); }} size="lg" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="surface" color="fg" rounded="xl">
            <Dialog.Header>
              <Dialog.Title>
                {t('purchaseRequests.detailsTitle')} #{request?.id}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {request && (
                <Stack gap={3}>
                  <Text fontSize="sm" color="fgMuted">
                    {t('field.status')}: <StatusChip status={request.status} />
                  </Text>
                  {request.notes && (
                    <Text fontSize="sm">
                      {t('purchaseRequests.notes')}: {request.notes}
                    </Text>
                  )}
                  {request.rejection_reason && (
                    <Text fontSize="sm" color="red.400">
                      {t('purchaseRequests.rejectionReason')}: {request.rejection_reason}
                    </Text>
                  )}
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row bg="surfaceAlt">
                        <Table.ColumnHeader>{t('purchaseRequests.material')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('purchaseRequests.quantity')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('purchaseRequests.unitPrice')}</Table.ColumnHeader>
                        <Table.ColumnHeader>{t('purchaseRequests.lineTotal')}</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {(request.items ?? []).map((it) => (
                        <Table.Row key={it.id}>
                          <Table.Cell>{it.material?.name_ar ?? `#${it.material_id}`}</Table.Cell>
                          <Table.Cell>{it.quantity}</Table.Cell>
                          <Table.Cell>{it.unit_price}</Table.Cell>
                          <Table.Cell>{it.total_price}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                  <Text textAlign="end" fontWeight="800">
                    {t('purchaseRequests.total')}: {request.total_amount} {t('common.sar')}
                  </Text>
                </Stack>
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
