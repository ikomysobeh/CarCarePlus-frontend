import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { AI_RULE_TYPES, CAR_TYPE_SIZES, FUEL_TYPES } from '../../utils/enums';
import { useCarBrands } from '../catalog/api';
import { useCreateAiRule, useUpdateAiRule } from './api';
import type { AiRule } from './types';

// brand_id/condition_key/condition_value/car_type/fuel_type are all optional on the backend —
// each is only included in the submitted payload when set, same "don't send what wasn't
// touched" approach as Inventory Transactions' destination_branch_id.
const schema = z.object({
  brand_id: z.coerce.number().optional(),
  name: z.string().min(1),
  name_ar: z.string().min(1),
  type: z.enum(AI_RULE_TYPES),
  condition_key: z.string().optional(),
  condition_value: z.string().optional(),
  car_type: z.enum(CAR_TYPE_SIZES).optional(),
  fuel_type: z.enum(FUEL_TYPES).optional(),
  response_template: z.string().min(1),
  is_active: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export default function AiRuleFormDialog({
  open,
  aiRule,
  onClose,
}: {
  open: boolean;
  aiRule: AiRule | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const brands = useCarBrands();
  const create = useCreateAiRule();
  const update = useUpdateAiRule();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand_id: '', name: '', name_ar: '', type: 'maintenance',
      condition_key: '', condition_value: '', car_type: undefined, fuel_type: undefined,
      response_template: '', is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        brand_id: aiRule?.brand_id ?? '',
        name: aiRule?.name ?? '',
        name_ar: aiRule?.name_ar ?? '',
        type: aiRule?.type ?? 'maintenance',
        condition_key: aiRule?.condition_key ?? '',
        condition_value: aiRule?.condition_value ?? '',
        car_type: aiRule?.car_type ?? undefined,
        fuel_type: aiRule?.fuel_type ?? undefined,
        response_template: aiRule?.response_template ?? '',
        is_active: aiRule?.is_active ?? true,
      });
    }
  }, [open, aiRule, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.parse(values);
    const input = {
      name: parsed.name,
      name_ar: parsed.name_ar,
      type: parsed.type,
      response_template: parsed.response_template,
      is_active: parsed.is_active,
      ...(parsed.brand_id ? { brand_id: parsed.brand_id } : {}),
      ...(parsed.condition_key ? { condition_key: parsed.condition_key } : {}),
      ...(parsed.condition_value ? { condition_value: parsed.condition_value } : {}),
      ...(parsed.car_type ? { car_type: parsed.car_type } : {}),
      ...(parsed.fuel_type ? { fuel_type: parsed.fuel_type } : {}),
    };
    try {
      if (aiRule) await update.mutateAsync({ id: aiRule.id, input });
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

  const brandOptions = brands.data?.map((b) => ({ value: b.id, label: b.name })) ?? [];
  const typeOptions = AI_RULE_TYPES.map((v) => ({ value: v, label: t(`enums.aiRuleType.${v}`) }));
  const carTypeOptions = CAR_TYPE_SIZES.map((v) => ({ value: v, label: t(`enums.carTypeSize.${v}`) }));
  const fuelTypeOptions = FUEL_TYPES.map((v) => ({ value: v, label: t(`enums.fuel.${v}`) }));

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={aiRule ? t('settings.editAiRule') : t('settings.addAiRule')}
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
        <FormSelect name="type" label={t('field.type')} options={typeOptions} required />
        <FormSelect name="brand_id" label={t('catalog.carBrands')} options={brandOptions} />
        <FormSelect name="car_type" label={t('cars.carType')} options={carTypeOptions} />
        <FormSelect name="fuel_type" label={t('cars.fuelType')} options={fuelTypeOptions} />
        <FormTextField name="condition_key" label={t('settings.conditionKey')} />
        <FormTextField name="condition_value" label={t('settings.conditionValue')} />
        <FormTextField name="response_template" label={t('settings.responseTemplate')} multiline rows={4} required />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
