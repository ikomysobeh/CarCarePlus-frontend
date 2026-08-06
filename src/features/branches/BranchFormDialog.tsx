import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useAdmins } from '../admin/api';
import { useCreateBranch, useUpdateBranch } from './api';
import type { Branch } from './types';

// Creating a branch requires an EXISTING admin_id — a user who already holds the `admin`
// role (see docs/10 §1's bootstrap flow: create an admin via the Admins screen first,
// then pick them here). That's why this is a dropdown fed by useAdmins(), not a free field.
const schema = z.object({
  admin_id: z.coerce.number().min(1),
  name: z.string().min(1),
  name_ar: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  latitude: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().min(-90).max(90).optional()),
  longitude: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().min(-180).max(180).optional()),
  is_active: z.boolean(),
  is_24h: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export default function BranchFormDialog({
  open,
  branch,
  onClose,
}: {
  open: boolean;
  branch: Branch | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const admins = useAdmins();
  const create = useCreateBranch();
  const update = useUpdateBranch();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      admin_id: '', name: '', name_ar: '', city: '', address: '', phone: '',
      latitude: '', longitude: '', is_active: true, is_24h: false,
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        admin_id: branch?.admin_id ?? '',
        name: branch?.name ?? '',
        name_ar: branch?.name_ar ?? '',
        city: branch?.city ?? '',
        address: branch?.address ?? '',
        phone: branch?.phone ?? '',
        latitude: branch?.latitude ?? '',
        longitude: branch?.longitude ?? '',
        is_active: branch?.is_active ?? true,
        is_24h: branch?.is_24h ?? false,
      });
    }
  }, [open, branch, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const v = schema.parse(values);
    try {
      if (branch) await update.mutateAsync({ id: branch.id, input: v });
      else await create.mutateAsync(v);
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        Object.entries(e.fieldErrors).forEach(([field, messages]) =>
          methods.setError(field as keyof FormValues, { message: messages[0] }),
        );
      }
    }
  };

  const adminOptions = admins.data?.map((a) => ({ value: a.id, label: `${a.name} (${a.email})` })) ?? [];

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={branch ? t('branches.edit') : t('branches.add')}
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
        <FormSelect name="admin_id" label={t('branches.manager')} options={adminOptions} required />
        <FormTextField name="name" label={t('field.name')} required />
        <FormTextField name="name_ar" label={t('field.nameAr')} required />
        <FormTextField name="city" label={t('branches.city')} required />
        <FormTextField name="address" label={t('branches.address')} required />
        <FormTextField name="phone" label={t('admin.phone')} required />
        <FormTextField name="latitude" label={t('branches.latitude')} type="number" />
        <FormTextField name="longitude" label={t('branches.longitude')} type="number" />
        <FormSwitch name="is_active" label={t('field.active')} />
        <FormSwitch name="is_24h" label={t('branches.is24h')} />
      </FormDialog>
    </FormProvider>
  );
}
