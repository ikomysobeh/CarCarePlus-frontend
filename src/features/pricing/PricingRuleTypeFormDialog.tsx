import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField } from '../../components';
import { ApiError } from '../../api/types';
import { useCreatePricingRuleType, useUpdatePricingRuleType } from './api';
import type { PricingRuleType } from './types';

const schema = z.object({
  name: z.string().min(1),
  name_ar: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export default function PricingRuleTypeFormDialog({
  open,
  ruleType,
  onClose,
}: {
  open: boolean;
  ruleType: PricingRuleType | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreatePricingRuleType();
  const update = useUpdatePricingRuleType();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', name_ar: '' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({ name: ruleType?.name ?? '', name_ar: ruleType?.name_ar ?? '' });
    }
  }, [open, ruleType, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    try {
      if (ruleType) await update.mutateAsync({ id: ruleType.id, input: values });
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
        title={ruleType ? t('pricing.editRuleType') : t('pricing.addRuleType')}
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
      </FormDialog>
    </FormProvider>
  );
}
