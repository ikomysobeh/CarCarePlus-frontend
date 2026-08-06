import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormSelect, FormTextField } from '../../components';
import { ApiError } from '../../api/types';
import { useServices } from '../catalog/api';
import { usePackages, useCreatePackageService, useUpdatePackageService } from './api';
import type { PackageService } from './types';

const schema = z.object({
  package_id: z.coerce.number().min(1),
  service_id: z.coerce.number().min(1),
  allowed_count: z.coerce.number().min(0),
});
type FormValues = z.input<typeof schema>;

export default function PackageServiceFormDialog({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: PackageService | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const packages = usePackages();
  const services = useServices();
  const create = useCreatePackageService();
  const update = useUpdatePackageService();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { package_id: '', service_id: '', allowed_count: '' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        package_id: row?.package_id ?? '',
        service_id: row?.service_id ?? '',
        allowed_count: row?.allowed_count ?? '',
      });
    }
  }, [open, row, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const input = schema.parse(values);
    try {
      if (row) await update.mutateAsync({ id: row.id, input });
      else await create.mutateAsync(input);
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
  const serviceOptions = services.data?.map((s) => ({ value: s.id, label: s.name_ar })) ?? [];

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={row ? t('packages.editService') : t('packages.addService')}
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
        <FormSelect name="package_id" label={t('packages.package')} options={packageOptions} required />
        <FormSelect name="service_id" label={t('packages.service')} options={serviceOptions} required />
        <FormTextField name="allowed_count" label={t('field.allowedCount')} type="number" required />
      </FormDialog>
    </FormProvider>
  );
}
