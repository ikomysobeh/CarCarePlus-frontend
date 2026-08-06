import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { usePricingRuleTypes, useCreatePricingRule, useUpdatePricingRule } from './api';
import type { PricingRule } from './types';

// `conditions` is free-form JSON on the backend (shape depends on the rule type — see
// docs/09), so we edit it as raw JSON text and parse/validate it at the form boundary
// rather than building type-specific structured fields.
function parseConditions(text: string): Record<string, unknown> | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const parsed = JSON.parse(trimmed);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('not an object');
  }
  return parsed as Record<string, unknown>;
}

const schema = z
  .object({
    pricing_rule_type_id: z.coerce.number().min(1),
    name: z.string().min(1),
    name_ar: z.string().min(1),
    value: z.coerce.number(),
    conditions_json: z.string().optional(),
    is_active: z.boolean(),
  })
  .refine(
    (d) => {
      if (!d.conditions_json?.trim()) return true;
      try {
        parseConditions(d.conditions_json);
        return true;
      } catch {
        return false;
      }
    },
    { path: ['conditions_json'], message: 'Must be a valid JSON object, e.g. {"vehicle_type":"SUV"}' },
  );
type FormValues = z.input<typeof schema>;

export default function PricingRuleFormDialog({
  open,
  rule,
  onClose,
}: {
  open: boolean;
  rule: PricingRule | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const ruleTypes = usePricingRuleTypes();
  const create = useCreatePricingRule();
  const update = useUpdatePricingRule();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pricing_rule_type_id: '', name: '', name_ar: '', value: '',
      conditions_json: '', is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        pricing_rule_type_id: rule?.pricing_rule_type_id ?? '',
        name: rule?.name ?? '',
        name_ar: rule?.name_ar ?? '',
        value: rule?.value ?? '',
        conditions_json: rule?.conditions ? JSON.stringify(rule.conditions, null, 2) : '',
        is_active: rule?.is_active ?? true,
      });
    }
  }, [open, rule, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const v = schema.parse(values);
    const input = {
      pricing_rule_type_id: v.pricing_rule_type_id,
      name: v.name,
      name_ar: v.name_ar,
      value: v.value,
      is_active: v.is_active,
      conditions: parseConditions(v.conditions_json ?? ''),
    };
    try {
      if (rule) await update.mutateAsync({ id: rule.id, input });
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

  const ruleTypeOptions = ruleTypes.data?.map((rt) => ({ value: rt.id, label: rt.name_ar })) ?? [];

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={rule ? t('pricing.editRule') : t('pricing.addRule')}
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
        <FormSelect name="pricing_rule_type_id" label={t('pricing.ruleTypes')} options={ruleTypeOptions} required />
        <FormTextField name="name" label={t('field.name')} required />
        <FormTextField name="name_ar" label={t('field.nameAr')} required />
        <FormTextField name="value" label={t('pricing.value')} type="number" required />
        <FormTextField
          name="conditions_json"
          label={t('pricing.conditions')}
          multiline
          rows={4}
        />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
