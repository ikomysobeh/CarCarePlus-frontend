import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect } from '../../components';
import { ApiError } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { useBranches } from '../branches/api';
import { useMaterials, useCreateInventory, useUpdateInventory } from './api';
import type { Inventory } from './types';

const emptyToUndef = (v: unknown) => (v === '' || v === null ? undefined : v);
const schema = z.object({
  branch_id: z.preprocess(emptyToUndef, z.coerce.number().min(1).optional()),
  material_id: z.coerce.number().min(1),
  quantity: z.preprocess(emptyToUndef, z.coerce.number().min(0).optional()),
  min_quantity: z.preprocess(emptyToUndef, z.coerce.number().min(0).optional()),
});
type FormValues = z.input<typeof schema>;

// Stock-level corrections, not day-to-day movement (use Transactions for that — docs/10 §5).
// The branch field is only shown to super_admin: for `admin`, the backend ignores/overrides
// whatever branch_id is sent and forces their own branch anyway, so we don't even offer the
// choice — avoids a confusing "I picked X but it saved as Y" moment.
export default function InventoryFormDialog({
  open,
  inventory,
  onClose,
}: {
  open: boolean;
  inventory: Inventory | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const branches = useBranches();
  const materials = useMaterials();
  const create = useCreateInventory();
  const update = useUpdateInventory();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { branch_id: '', material_id: '', quantity: '', min_quantity: '' },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        branch_id: inventory?.branch_id ?? '',
        material_id: inventory?.material_id ?? '',
        quantity: inventory?.quantity ?? '',
        min_quantity: inventory?.min_quantity ?? '',
      });
    }
  }, [open, inventory, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const v = schema.parse(values);
    try {
      if (inventory) await update.mutateAsync({ id: inventory.id, input: v });
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

  const branchOptions = branches.data?.map((b) => ({ value: b.id, label: b.name_ar })) ?? [];
  const materialOptions = materials.data?.map((m) => ({ value: m.id, label: m.name_ar })) ?? [];

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={inventory ? t('inventory.editStock') : t('inventory.addStock')}
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
        {isSuperAdmin && <FormSelect name="branch_id" label={t('cars.branch')} options={branchOptions} required />}
        <FormSelect name="material_id" label={t('inventory.materials')} options={materialOptions} required />
        <FormTextField name="quantity" label={t('inventory.quantity')} type="number" />
        <FormTextField name="min_quantity" label={t('inventory.minQuantity')} type="number" />
      </FormDialog>
    </FormProvider>
  );
}
