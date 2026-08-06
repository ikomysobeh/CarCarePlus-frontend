import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormSelect, FormTextField, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useSubServices } from '../catalog/api';
import {
  usePackageServices,
  useCreatePackageServiceSubService,
  useUpdatePackageServiceSubService,
} from './api';
import type { PackageServiceSubService } from './types';

const schema = z.object({
  package_service_id: z.coerce.number().min(1),
  sub_service_id: z.coerce.number().min(1),
  price_override: z.coerce.number().min(0).optional(),
  is_active: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export default function PackageServiceSubServiceFormDialog({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: PackageServiceSubService | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const packageServices = usePackageServices();
  const subServices = useSubServices();
  const create = useCreatePackageServiceSubService();
  const update = useUpdatePackageServiceSubService();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { package_service_id: '', sub_service_id: '', price_override: '', is_active: true },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        package_service_id: row?.package_service_id ?? '',
        sub_service_id: row?.sub_service_id ?? '',
        price_override: row?.price_override ?? '',
        is_active: row?.is_active ?? true,
      });
    }
  }, [open, row, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.parse(values);
    // price_override is optional — only send it when a value was entered.
    const input = {
      package_service_id: parsed.package_service_id,
      sub_service_id: parsed.sub_service_id,
      is_active: parsed.is_active,
      ...(values.price_override !== '' && values.price_override != null
        ? { price_override: parsed.price_override }
        : {}),
    };
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

  // Label a package-service by "package · service" so it's identifiable in the dropdown.
  const packageServiceOptions =
    packageServices.data?.map((ps) => ({
      value: ps.id,
      label: `${ps.package?.name ?? `#${ps.package_id}`} · ${ps.service?.name_ar ?? `#${ps.service_id}`}`,
    })) ?? [];
  const subServiceOptions = subServices.data?.map((s) => ({ value: s.id, label: s.name_ar })) ?? [];

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={row ? t('packages.editSubService') : t('packages.addSubService')}
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
        <FormSelect
          name="package_service_id"
          label={t('packages.packageService')}
          options={packageServiceOptions}
          required
        />
        <FormSelect name="sub_service_id" label={t('packages.subService')} options={subServiceOptions} required />
        <FormTextField name="price_override" label={t('field.priceOverride')} type="number" />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
