import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useCreateCarBrand, useUpdateCarBrand } from './api';
import type { CarBrand } from './types';

const schema = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export default function CarBrandFormDialog({
  open,
  carBrand,
  onClose,
}: {
  open: boolean;
  carBrand: CarBrand | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateCarBrand();
  const update = useUpdateCarBrand();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', logo: '', is_active: true },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: carBrand?.name ?? '',
        logo: carBrand?.logo ?? '',
        is_active: carBrand?.is_active ?? true,
      });
    }
  }, [open, carBrand, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const input = schema.parse(values);
    try {
      if (carBrand) await update.mutateAsync({ id: carBrand.id, input });
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

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={carBrand ? t('catalog.editCarBrand') : t('catalog.addCarBrand')}
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
        <FormTextField name="logo" label={t('field.logo')} />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
