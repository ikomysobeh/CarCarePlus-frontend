import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useCreateMaterialUnit, useUpdateMaterialUnit } from './api';
import type { MaterialUnit } from './types';

const schema = z.object({
  name: z.string().min(1),
  name_ar: z.string().min(1),
  is_decimal: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function MaterialUnitFormDialog({
  open,
  unit,
  onClose,
}: {
  open: boolean;
  unit: MaterialUnit | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateMaterialUnit();
  const update = useUpdateMaterialUnit();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', name_ar: '', is_decimal: false },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: unit?.name ?? '',
        name_ar: unit?.name_ar ?? '',
        is_decimal: unit?.is_decimal ?? false,
      });
    }
  }, [open, unit, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    try {
      if (unit) await update.mutateAsync({ id: unit.id, input: values });
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
        title={unit ? t('inventory.editUnit') : t('inventory.addUnit')}
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
        <FormSwitch name="is_decimal" label={t('inventory.isDecimal')} />
      </FormDialog>
    </FormProvider>
  );
}
