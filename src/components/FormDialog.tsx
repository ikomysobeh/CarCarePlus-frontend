import type { FormEventHandler, ReactNode } from 'react';
import { Button, CloseButton, Dialog, Portal, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// A reusable modal shell for create/edit forms (Chakra). Wrap it in a <FormProvider> and
// pass the RHF-bound submit handler. Children are the form fields.
//
//   <FormProvider {...methods}>
//     <FormDialog open title={...} busy={...} onClose={...} onSubmit={methods.handleSubmit(onSubmit)}>
//       <FormTextField name="..." .../>
//     </FormDialog>
//   </FormProvider>
export default function FormDialog({
  open,
  title,
  busy,
  onClose,
  onSubmit,
  children,
}: {
  open: boolean;
  title: string;
  busy?: boolean;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size="md"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="surface" color="fg" rounded="xl">
            <form onSubmit={onSubmit}>
              <Dialog.Header>
                <Dialog.Title>{title}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>{children}</Stack>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" colorPalette="brand" loading={busy}>
                  {t('common.save')}
                </Button>
              </Dialog.Footer>
            </form>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" disabled={busy} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
