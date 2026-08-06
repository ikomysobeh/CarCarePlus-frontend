import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useMaterialUnits, useCreateMaterial, useUpdateMaterial } from './api';
import type { Material } from './types';

const schema = z.object({
  material_unit_id: z.coerce.number().min(1),
  name: z.string().min(1),
  name_ar: z.string().min(1),
  description: z.string().optional(),
  unit_price: z.coerce.number().min(0),
  is_vip_material: z.boolean(),
  is_visible_to_customer: z.boolean(),
  is_active: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export default function MaterialFormDialog({
  open,
  material,
  onClose,
}: {
  open: boolean;
  material: Material | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const units = useMaterialUnits();
  const create = useCreateMaterial();
  const update = useUpdateMaterial();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      material_unit_id: '', name: '', name_ar: '', description: '',
      unit_price: '', is_vip_material: false, is_visible_to_customer: false, is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        material_unit_id: material?.material_unit_id ?? '',
        name: material?.name ?? '',
        name_ar: material?.name_ar ?? '',
        description: material?.description ?? '',
        unit_price: material?.unit_price ?? '',
        is_vip_material: material?.is_vip_material ?? false,
        is_visible_to_customer: material?.is_visible_to_customer ?? false,
        is_active: material?.is_active ?? true,
      });
    }
  }, [open, material, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const v = schema.parse(values);
    try {
      if (material) await update.mutateAsync({ id: material.id, input: v });
      else await create.mutateAsync(v);
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        Object.entries(e.fieldErrors).forEach(([field, messages]) =>
          methods.setError(field as keyof FormValues, { message: messages[0] }),
        );
      }
    }
  };

  const unitOptions = units.data?.map((u) => ({ value: u.id, label: u.name_ar })) ?? [];

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={material ? t('inventory.editMaterial') : t('inventory.addMaterial')}
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
        <FormSelect name="material_unit_id" label={t('inventory.units')} options={unitOptions} required />
        <FormTextField name="name" label={t('field.name')} required />
        <FormTextField name="name_ar" label={t('field.nameAr')} required />
        <FormTextField name="description" label={t('field.description')} multiline rows={2} />
        <FormTextField name="unit_price" label={t('inventory.unitPrice')} type="number" required />
        <FormSwitch name="is_vip_material" label={t('inventory.isVip')} />
        <FormSwitch name="is_visible_to_customer" label={t('inventory.isVisibleToCustomer')} />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
