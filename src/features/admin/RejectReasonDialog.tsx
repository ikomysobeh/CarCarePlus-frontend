import { useEffect, useState } from 'react';
import { Button, CloseButton, Dialog, Field, Portal, Textarea } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// Collects an optional rejection reason, then calls onConfirm(reason).
export default function RejectReasonDialog({
  open,
  title,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
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
    <Dialog.Root open={open} onOpenChange={(e) => { if (!e.open) onClose(); }} size="xs" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="surface" color="fg" rounded="xl">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>{t('admin.rejectReason')}</Field.Label>
                <Textarea
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('admin.rejectReasonHint')}
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
                {t('admin.reject')}
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
