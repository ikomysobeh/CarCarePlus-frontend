import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField } from '../../components';
import { ApiError } from '../../api/types';
import { useAdjustWallet } from './api';
import type { Wallet } from './types';

// amount must be non-zero: positive credits, negative debits (matches AdjustWalletRequest).
const schema = z.object({
  amount: z.coerce.number().refine((n) => n !== 0, { message: 'required' }),
  note: z.string().optional(),
});
type FormValues = z.input<typeof schema>;

export default function AdjustWalletDialog({
  open,
  wallet,
  onClose,
}: {
  open: boolean;
  wallet: Wallet | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const adjust = useAdjustWallet();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', note: '' },
  });

  useEffect(() => {
    if (open) methods.reset({ amount: '', note: '' });
  }, [open, methods]);

  const onSubmit = async (values: FormValues) => {
    if (!wallet) return;
    const v = schema.parse(values);
    try {
      await adjust.mutateAsync({ customerId: wallet.user_id, input: v });
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        Object.entries(e.fieldErrors).forEach(([field, messages]) =>
          methods.setError(field as keyof FormValues, { message: messages[0] }),
        );
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={t('wallets.adjustTitle')}
        busy={adjust.isPending}
        onClose={onClose}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {adjust.error instanceof ApiError && !adjust.error.fieldErrors && (
          <Alert.Root status="error" rounded="md">
            <Alert.Indicator />
            <Alert.Title>{adjust.error.message}</Alert.Title>
          </Alert.Root>
        )}
        <FormTextField name="amount" label={t('wallets.amount')} type="number" required />
        <FormTextField name="note" label={t('wallets.note')} multiline rows={2} />
      </FormDialog>
    </FormProvider>
  );
}
