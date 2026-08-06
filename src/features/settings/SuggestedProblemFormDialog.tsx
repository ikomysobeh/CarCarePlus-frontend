import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect } from '../../components';
import { ApiError } from '../../api/types';
import { SUGGESTED_PROBLEM_CATEGORIES } from '../../utils/enums';
import { useCreateSuggestedProblem, useUpdateSuggestedProblem } from './api';
import type { SuggestedProblem } from './types';

const schema = z.object({
  name: z.string().min(1),
  name_ar: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(SUGGESTED_PROBLEM_CATEGORIES),
});
type FormValues = z.infer<typeof schema>;

export default function SuggestedProblemFormDialog({
  open,
  suggestedProblem,
  onClose,
}: {
  open: boolean;
  suggestedProblem: SuggestedProblem | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateSuggestedProblem();
  const update = useUpdateSuggestedProblem();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', name_ar: '', description: '', category: 'engine' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: suggestedProblem?.name ?? '',
        name_ar: suggestedProblem?.name_ar ?? '',
        description: suggestedProblem?.description ?? '',
        category: suggestedProblem?.category ?? 'engine',
      });
    }
  }, [open, suggestedProblem, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    try {
      if (suggestedProblem) await update.mutateAsync({ id: suggestedProblem.id, input: values });
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

  const categoryOptions = SUGGESTED_PROBLEM_CATEGORIES.map((c) => ({
    value: c,
    label: t(`enums.problemCategory.${c}`),
  }));

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={suggestedProblem ? t('settings.editSuggestedProblem') : t('settings.addSuggestedProblem')}
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
        <FormSelect name="category" label={t('settings.category')} options={categoryOptions} required />
        <FormTextField name="description" label={t('field.description')} multiline rows={3} />
      </FormDialog>
    </FormProvider>
  );
}
