import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormSelect, FormTextField } from '../../components';
import { ApiError } from '../../api/types';
import { USER_PACKAGE_STATUSES } from '../../utils/enums';
import { usePackages } from '../packages/api';
import { useCreateUserPackage, useUpdateUserPackage } from './api';
import type { UserPackage } from './types';

const schema = z.object({
  package_id: z.coerce.number().min(1),
  remaining_count: z.coerce.number().min(0).optional(),
  status: z.enum(USER_PACKAGE_STATUSES),
});
type FormValues = z.input<typeof schema>;

export default function UserPackageFormDialog({
  open,
  customerId,
  row,
  onClose,
}: {
  open: boolean;
  customerId?: number;
  row: UserPackage | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const packages = usePackages();
  const create = useCreateUserPackage(customerId);
  const update = useUpdateUserPackage(customerId);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { package_id: '', remaining_count: '', status: 'active' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        package_id: row?.package_id ?? '',
        remaining_count: row?.remaining_count ?? '',
        status: row?.status ?? 'active',
      });
    }
  }, [open, row, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.parse(values);
    try {
      if (row) {
        await update.mutateAsync({
          id: row.id,
          input: { remaining_count: parsed.remaining_count, status: parsed.status },
        });
      } else {
        await create.mutateAsync({ package_id: parsed.package_id, status: parsed.status });
      }
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        Object.entries(e.fieldErrors).forEach(([field, messages]) =>
          methods.setError(field as keyof FormValues, { message: messages[0] }),
        );
      }
    }
  };

  const packageOptions = packages.data?.map((p) => ({ value: p.id, label: p.name })) ?? [];
  const statusOptions = USER_PACKAGE_STATUSES.map((s) => ({ value: s, label: t(`status.${s}`) }));

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={row ? t('subscriptions.edit') : t('subscriptions.add')}
        busy={busy}
        onClose={onClose}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {serverError instanceof ApiError && !serverError.fieldErrors && (
          <Alert.Root status="error" rounded="md">
            <Alert.Indicator />
            <Alert.Title>{serverError.message}</Alert.Title>
          </Alert.Root>
        )}
        {row ? (
          <FormTextField name="remaining_count" label={t('field.remainingCount')} type="number" />
        ) : (
          <FormSelect name="package_id" label={t('packages.package')} options={packageOptions} required />
        )}
        <FormSelect name="status" label={t('field.status')} options={statusOptions} required />
      </FormDialog>
    </FormProvider>
  );
}
