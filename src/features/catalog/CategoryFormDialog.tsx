import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useCreateCategory, useUpdateCategory } from './api';
import type { Category } from './types';

const schema = z.object({
  name: z.string().min(1),
  name_ar: z.string().min(1),
  description: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function CategoryFormDialog({
  open,
  category,
  onClose,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateCategory();
  const update = useUpdateCategory();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', name_ar: '', description: '', is_active: true },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: category?.name ?? '',
        name_ar: category?.name_ar ?? '',
        description: category?.description ?? '',
        is_active: category?.is_active ?? true,
      });
    }
  }, [open, category, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    try {
      if (category) await update.mutateAsync({ id: category.id, input: values });
      else await create.mutateAsync(values);
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
        title={category ? t('catalog.editCategory') : t('catalog.addCategory')}
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
        <FormTextField name="description" label={t('field.description')} multiline rows={3} />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
