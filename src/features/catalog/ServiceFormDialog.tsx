import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useCategories, useCreateService, useUpdateService } from './api';
import type { Service } from './types';

const schema = z
  .object({
    category_id: z.coerce.number().min(1),
    name: z.string().min(1),
    name_ar: z.string().min(1),
    description: z.string().optional(),
    base_price: z.coerce.number().min(0),
    is_vip_available: z.boolean(),
    vip_extra_price: z.coerce.number().min(0).optional(),
    duration_minutes: z.coerce.number().min(1),
  })
  .refine((d) => !d.is_vip_available || (d.vip_extra_price ?? 0) > 0, {
    path: ['vip_extra_price'],
    message: 'required',
  });
type FormValues = z.input<typeof schema>;

export default function ServiceFormDialog({
  open,
  service,
  onClose,
}: {
  open: boolean;
  service: Service | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const categories = useCategories();
  const create = useCreateService();
  const update = useUpdateService();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: '', name: '', name_ar: '', description: '',
      base_price: '', is_vip_available: false, vip_extra_price: '', duration_minutes: '',
    },
  });
  const vipOn = methods.watch('is_vip_available');

  useEffect(() => {
    if (open) {
      methods.reset({
        category_id: service?.category_id ?? '',
        name: service?.name ?? '',
        name_ar: service?.name_ar ?? '',
        description: service?.description ?? '',
        base_price: service?.base_price ?? '',
        is_vip_available: service?.is_vip_available ?? false,
        vip_extra_price: service?.vip_extra_price ?? '',
        duration_minutes: service?.duration_minutes ?? '',
      });
    }
  }, [open, service, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.parse(values);
    const input = {
      category_id: parsed.category_id,
      name: parsed.name,
      name_ar: parsed.name_ar,
      description: parsed.description,
      base_price: parsed.base_price,
      is_vip_available: parsed.is_vip_available,
      duration_minutes: parsed.duration_minutes,
      ...(parsed.is_vip_available ? { vip_extra_price: parsed.vip_extra_price } : {}),
    };
    try {
      if (service) await update.mutateAsync({ id: service.id, input });
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

  const categoryOptions = categories.data?.map((c) => ({ value: c.id, label: c.name_ar })) ?? [];

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={service ? t('catalog.editService') : t('catalog.addService')}
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
        <FormSelect name="category_id" label={t('catalog.categories')} options={categoryOptions} required />
        <FormTextField name="name" label={t('field.name')} required />
        <FormTextField name="name_ar" label={t('field.nameAr')} required />
        <FormTextField name="description" label={t('field.description')} multiline rows={2} />
        <FormTextField name="base_price" label={t('field.basePrice')} type="number" required />
        <FormTextField name="duration_minutes" label={t('field.durationMinutes')} type="number" required />
        <FormSwitch name="is_vip_available" label={t('field.vipAvailable')} />
        {vipOn && <FormTextField name="vip_extra_price" label={t('field.vipExtraPrice')} type="number" required />}
      </FormDialog>
    </FormProvider>
  );
}
