import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { PACKAGE_TYPES } from '../../utils/enums';
import { useCreatePackage, useUpdatePackage } from './api';
import type { Package } from './types';

// Numeric fields use z.coerce.number because the inputs give strings (and the API returns
// price/discount as strings too). `is_company_package` (docs/11 §3) determines which
// customer account type can even see this package (personal vs. company) — super_admin/admin
// always see everything regardless, only the customer-facing filtering cares about this flag.
const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(PACKAGE_TYPES),
  is_company_package: z.boolean(),
  price: z.coerce.number().min(0),
  discount_pct: z.coerce.number().min(0).max(100).optional(),
  services_count: z.coerce.number().min(0),
  valid_days: z.coerce.number().min(0),
  is_active: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export default function PackageFormDialog({
  open,
  pkg,
  onClose,
}: {
  open: boolean;
  pkg: Package | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreatePackage();
  const update = useUpdatePackage();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', description: '', type: 'monthly', is_company_package: false,
      price: '', discount_pct: '', services_count: '', valid_days: '', is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: pkg?.name ?? '',
        description: pkg?.description ?? '',
        type: pkg?.type ?? 'monthly',
        is_company_package: pkg?.is_company_package ?? false,
        price: pkg?.price ?? '',
        discount_pct: pkg?.discount_pct ?? '',
        services_count: pkg?.services_count ?? '',
        valid_days: pkg?.valid_days ?? '',
        is_active: pkg?.is_active ?? true,
      });
    }
  }, [open, pkg, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const input = schema.parse(values);
    try {
      if (pkg) await update.mutateAsync({ id: pkg.id, input });
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

  const typeOptions = PACKAGE_TYPES.map((ty) => ({
    value: ty,
    label: t(`enums.packageType.${ty}`),
  }));

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={pkg ? t('packages.edit') : t('packages.add')}
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
        <FormTextField name="name" label={t('field.name')} required />
        <FormTextField name="description" label={t('field.description')} multiline rows={2} />
        <FormSelect name="type" label={t('field.type')} options={typeOptions} required />
        <FormSwitch name="is_company_package" label={t('packages.isCompanyPackage')} />
        <FormTextField name="price" label={t('field.price')} type="number" required />
        <FormTextField name="discount_pct" label={t('field.discountPct')} type="number" />
        <FormTextField name="services_count" label={t('field.servicesCount')} type="number" required />
        <FormTextField name="valid_days" label={t('field.validDays')} type="number" required />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
