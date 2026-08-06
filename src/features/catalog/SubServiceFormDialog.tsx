import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useServices, useCreateSubService, useUpdateSubService } from './api';
import type { SubService } from './types';

const schema = z.object({
  service_id: z.coerce.number().min(1),
  name: z.string().min(1),
  name_ar: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  is_active: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export default function SubServiceFormDialog({
  open,
  subService,
  onClose,
}: {
  open: boolean;
  subService: SubService | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const services = useServices();
  const create = useCreateSubService();
  const update = useUpdateSubService();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service_id: '', name: '', name_ar: '', description: '', price: '', is_active: true },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        service_id: subService?.service_id ?? '',
        name: subService?.name ?? '',
        name_ar: subService?.name_ar ?? '',
        description: subService?.description ?? '',
        price: subService?.price ?? '',
        is_active: subService?.is_active ?? true,
      });
    }
  }, [open, subService, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const input = schema.parse(values);
    try {
      if (subService) await update.mutateAsync({ id: subService.id, input });
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

  const serviceOptions = services.data?.map((s) => ({ value: s.id, label: s.name_ar })) ?? [];

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={subService ? t('catalog.editSubService') : t('catalog.addSubService')}
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
        <FormSelect name="service_id" label={t('catalog.services')} options={serviceOptions} required />
        <FormTextField name="name" label={t('field.name')} required />
        <FormTextField name="name_ar" label={t('field.nameAr')} required />
        <FormTextField name="description" label={t('field.description')} multiline rows={2} />
        <FormTextField name="price" label={t('field.price')} type="number" required />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
