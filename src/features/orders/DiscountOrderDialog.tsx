import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField } from '../../components';
import { ApiError } from '../../api/types';
import { useApplyDiscount } from './api';

// M25: apply a discount to a booking (super_admin). value must be > 0 and ≤ 100.
const schema = z.object({
  value: z.coerce.number().gt(0).max(100),
  reason: z.string().optional(),
});
type FormValues = z.input<typeof schema>;

export default function DiscountOrderDialog({
  open,
  orderId,
  onClose,
}: {
  open: boolean;
  orderId: number | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const discount = useApplyDiscount();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { value: '', reason: '' },
  });

  useEffect(() => {
    if (open) methods.reset({ value: '', reason: '' });
  }, [open, methods]);

  const onSubmit = async (values: FormValues) => {
    if (orderId == null) return;
    const v = schema.parse(values);
    try {
      await discount.mutateAsync({ id: orderId, input: v });
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
        title={t('orderDetail.discountTitle')}
        busy={discount.isPending}
        onClose={onClose}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {discount.error instanceof ApiError && !discount.error.fieldErrors && (
          <Alert.Root status="error" rounded="md">
            <Alert.Indicator />
            <Alert.Title>{discount.error.message}</Alert.Title>
          </Alert.Root>
        )}
        <FormTextField name="value" label={t('orderDetail.discountValue')} type="number" required />
        <FormTextField name="reason" label={t('orderDetail.discountReason')} multiline rows={2} />
      </FormDialog>
    </FormProvider>
  );
}
