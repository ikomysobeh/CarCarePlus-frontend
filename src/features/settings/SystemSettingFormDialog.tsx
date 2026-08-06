import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect } from '../../components';
import { ApiError } from '../../api/types';
import { SYSTEM_SETTING_TYPES } from '../../utils/enums';
import { useCreateSystemSetting, useUpdateSystemSetting } from './api';
import type { SystemSetting } from './types';

const schema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  type: z.enum(SYSTEM_SETTING_TYPES),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// `key` is unique server-side — a duplicate surfaces as a normal 422, caught by the
// existing fieldErrors -> setError path below, nothing special needed for it.
export default function SystemSettingFormDialog({
  open,
  systemSetting,
  onClose,
}: {
  open: boolean;
  systemSetting: SystemSetting | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateSystemSetting();
  const update = useUpdateSystemSetting();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { key: '', value: '', type: 'string', description: '' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        key: systemSetting?.key ?? '',
        value: systemSetting?.value ?? '',
        type: systemSetting?.type ?? 'string',
        description: systemSetting?.description ?? '',
      });
    }
  }, [open, systemSetting, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    try {
      if (systemSetting) await update.mutateAsync({ id: systemSetting.id, input: values });
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

  const typeOptions = SYSTEM_SETTING_TYPES.map((t2) => ({
    value: t2,
    label: t(`enums.systemSettingType.${t2}`),
  }));

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={systemSetting ? t('settings.editSystemSetting') : t('settings.addSystemSetting')}
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
        <FormTextField name="key" label={t('settings.key')} required />
        <FormTextField name="value" label={t('settings.value')} required />
        <FormSelect name="type" label={t('field.type')} options={typeOptions} required />
        <FormTextField name="description" label={t('field.description')} multiline rows={2} />
      </FormDialog>
    </FormProvider>
  );
}
