import { useEffect, useState } from 'react';
import { Button, CloseButton, Dialog, Field, Portal, Textarea } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// Collects a REQUIRED rejection_reason (RejectPurchaseRequestRequest enforces it), then
// calls onConfirm(reason). Same shape as orders/CancelOrderDialog.
export default function RejectPurchaseRequestDialog({
  open,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(e) => { if (!e.open) onClose(); }} size="xs" placement="center" role="alertdialog">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="surface" color="fg" rounded="xl">
            <Dialog.Header>
              <Dialog.Title>{t('purchaseRequests.rejectTitle')}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root required>
                <Field.Label>{t('purchaseRequests.rejectReason')}</Field.Label>
                <Textarea
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('purchaseRequests.rejectReasonHint')}
                  rows={3}
                  bg="surface"
                  borderColor="line"
                />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer gap={2}>
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                {t('common.cancel')}
              </Button>
              <Button colorPalette="red" onClick={() => onConfirm(reason)} loading={loading} disabled={!reason.trim()}>
                {t('purchaseRequests.reject')}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" disabled={loading} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
