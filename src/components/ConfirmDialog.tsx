import { Button, CloseButton, Dialog, Portal, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// A reusable yes/no confirmation modal (Chakra). Parent controls `open` + callbacks.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  destructive,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size="xs"
      placement="center"
      role="alertdialog"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="surface" color="fg" rounded="xl">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            {message && (
              <Dialog.Body>
                <Text color="fgMuted">{message}</Text>
              </Dialog.Body>
            )}
            <Dialog.Footer gap={2}>
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                {cancelText ?? t('common.cancel')}
              </Button>
              <Button
                colorPalette={destructive ? 'red' : 'brand'}
                onClick={onConfirm}
                loading={loading}
              >
                {confirmText ?? t('common.confirm', { defaultValue: 'Confirm' })}
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
