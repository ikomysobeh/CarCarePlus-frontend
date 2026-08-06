import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField } from '../../components';
import { ApiError } from '../../api/types';
import { useCreateWorkshop, useUpdateWorkshop } from './api';
import type { Workshop } from './types';

// No `is_active`/`status` field here — status is set via the approval flow (ApprovalsPage,
// built back in M0-era), not through this CRUD form.
const emptyToUndef = (v: unknown) => (v === '' || v === null ? undefined : v);
const schema = z.object({
  name: z.string().min(1),
  name_ar: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  latitude: z.preprocess(emptyToUndef, z.coerce.number().optional()),
  longitude: z.preprocess(emptyToUndef, z.coerce.number().optional()),
});
type FormValues = z.input<typeof schema>;

export default function WorkshopFormDialog({
  open,
  workshop,
  onClose,
}: {
  open: boolean;
  workshop: Workshop | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateWorkshop();
  const update = useUpdateWorkshop();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', name_ar: '', address: '', city: '', latitude: '', longitude: '' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: workshop?.name ?? '',
        name_ar: workshop?.name_ar ?? '',
        address: workshop?.address ?? '',
        city: workshop?.city ?? '',
        latitude: workshop?.latitude ?? '',
        longitude: workshop?.longitude ?? '',
      });
    }
  }, [open, workshop, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const v = schema.parse(values);
    try {
      if (workshop) await update.mutateAsync({ id: workshop.id, input: v });
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

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={workshop ? t('workshops.edit') : t('workshops.add')}
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
        <FormTextField name="name_ar" label={t('field.nameAr')} required />
        <FormTextField name="city" label={t('branches.city')} required />
        <FormTextField name="address" label={t('branches.address')} required />
        <FormTextField name="latitude" label={t('branches.latitude')} type="number" />
        <FormTextField name="longitude" label={t('branches.longitude')} type="number" />
      </FormDialog>
    </FormProvider>
  );
}
