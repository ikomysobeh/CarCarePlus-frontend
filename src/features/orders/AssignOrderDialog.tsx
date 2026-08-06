import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField } from '../../components';
import { ApiError } from '../../api/types';
import { useAssignOrder } from './api';
import type { Order } from './types';

const schema = z.object({ employee_id: z.coerce.number().min(1) });
type FormValues = z.input<typeof schema>;

// ⚠️ No GET /employees list endpoint exists yet — same "known limitation" as Workshops'
// user_id and Cars' customer_id (docs/10 §3, docs/03). Plain numeric field for now.
export default function AssignOrderDialog({
  open,
  order,
  onClose,
}: {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const assign = useAssignOrder();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employee_id: '' },
  });

  useEffect(() => {
    if (open) methods.reset({ employee_id: '' });
  }, [open, methods]);

  const onSubmit = async (values: FormValues) => {
    if (!order) return;
    const v = schema.parse(values);
    try {
      await assign.mutateAsync({ id: order.id, input: v });
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
        title={t('orders.assign')}
        busy={assign.isPending}
        onClose={onClose}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {assign.error instanceof ApiError && !assign.error.fieldErrors && (
          <Alert.Root status="error" rounded="md">
            <Alert.Indicator />
            <Alert.Title>{assign.error.message}</Alert.Title>
          </Alert.Root>
        )}
        <FormTextField name="employee_id" label={t('orders.employeeId')} type="number" required />
      </FormDialog>
    </FormProvider>
  );
}
