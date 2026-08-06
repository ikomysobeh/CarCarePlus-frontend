import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useCreateProblemType, useUpdateProblemType } from './api';
import type { ProblemType } from './types';

const schema = z.object({
  name: z.string().min(1),
  name_ar: z.string().min(1),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function ProblemTypeFormDialog({
  open,
  problemType,
  onClose,
}: {
  open: boolean;
  problemType: ProblemType | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateProblemType();
  const update = useUpdateProblemType();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', name_ar: '', is_active: true },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: problemType?.name ?? '',
        name_ar: problemType?.name_ar ?? '',
        is_active: problemType?.is_active ?? true,
      });
    }
  }, [open, problemType, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    try {
      if (problemType) await update.mutateAsync({ id: problemType.id, input: values });
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
        title={problemType ? t('settings.editProblemType') : t('settings.addProblemType')}
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
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
