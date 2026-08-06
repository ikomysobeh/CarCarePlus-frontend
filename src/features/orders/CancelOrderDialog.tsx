import { useEffect, useState } from 'react';
import { Button, CloseButton, Dialog, Field, Portal, Textarea } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// Same shape as admin/RejectReasonDialog.tsx — collects an optional cancel_reason, then
// calls onConfirm(reason). Kept as its own component since it lives in a different feature
// and the copy (title/labels) is order-specific.
export default function CancelOrderDialog({
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
              <Dialog.Title>{t('orders.cancelTitle')}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>{t('orders.cancelReason')}</Field.Label>
                <Textarea
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('orders.cancelReasonHint')}
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
              <Button colorPalette="red" onClick={() => onConfirm(reason)} loading={loading}>
                {t('orders.cancelConfirm')}
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
