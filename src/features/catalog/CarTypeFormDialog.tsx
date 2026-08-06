import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useCreateCarType, useUpdateCarType } from './api';
import type { CarType } from './types';

const schema = z.object({
  name: z.string().min(1),
  name_ar: z.string().min(1),
  price_multiplier: z.coerce.number().min(0),
  is_active: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export default function CarTypeFormDialog({
  open,
  carType,
  onClose,
}: {
  open: boolean;
  carType: CarType | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateCarType();
  const update = useUpdateCarType();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', name_ar: '', price_multiplier: '1', is_active: true },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: carType?.name ?? '',
        name_ar: carType?.name_ar ?? '',
        price_multiplier: carType?.price_multiplier ?? '1',
        is_active: carType?.is_active ?? true,
      });
    }
  }, [open, carType, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const input = schema.parse(values);
    try {
      if (carType) await update.mutateAsync({ id: carType.id, input });
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
        title={carType ? t('catalog.editCarType') : t('catalog.addCarType')}
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
        <FormTextField name="price_multiplier" label={t('field.priceMultiplier')} type="number" required />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
