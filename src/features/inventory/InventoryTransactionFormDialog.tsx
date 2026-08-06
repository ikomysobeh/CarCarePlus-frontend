import { Alert, Text } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect } from '../../components';
import { ApiError } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { useBranches } from '../branches/api';
import { useMaterials, useCreateInventoryTransaction } from './api';

const emptyToUndef = (v: unknown) => (v === '' || v === null ? undefined : v);

// Only these three are ever SENT — 'transfer_in' is system-generated only (rejected if
// sent), so it never appears as a selectable option (docs/10 §5).
const TX_TYPES = ['in', 'out', 'transfer_out'] as const;

const schema = z
  .object({
    branch_id: z.preprocess(emptyToUndef, z.coerce.number().min(1).optional()),
    destination_branch_id: z.preprocess(emptyToUndef, z.coerce.number().min(1).optional()),
    material_id: z.coerce.number().min(1),
    type: z.enum(TX_TYPES),
    quantity: z.coerce.number().min(0.01),
    reference_id: z.string().optional(),
    note: z.string().optional(),
  })
  // Client-side mirror of the backend's "destination must differ from source" rule —
  // catches the mistake before a 422 round-trip.
  .refine((d) => d.type !== 'transfer_out' || d.destination_branch_id !== d.branch_id, {
    path: ['destination_branch_id'],
    message: 'mustDifferFromSource',
  });
type FormValues = z.input<typeof schema>;

// Create-only — this is an append-only ledger (docs/10 §5), there's no update/delete.
export default function InventoryTransactionFormDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const branches = useBranches();
  const materials = useMaterials();
  const create = useCreateInventoryTransaction();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      branch_id: '', destination_branch_id: '', material_id: '',
      type: 'in', quantity: '', reference_id: '', note: '',
    },
  });

  // The one genuinely new pattern here: show destination_branch_id ONLY when
  // type === 'transfer_out' — same "watch a field, conditionally render another" trick
  // used for Service.vip_extra_price.
  const type = methods.watch('type');

  const onSubmit = async (values: FormValues) => {
    const v = schema.parse(values);
    const input = {
      branch_id: v.branch_id,
      material_id: v.material_id,
      type: v.type,
      quantity: v.quantity,
      reference_id: v.reference_id,
      note: v.note,
      // Never send destination_branch_id for in/out — the backend prohibits it outside
      // transfer_out.
      ...(v.type === 'transfer_out' ? { destination_branch_id: v.destination_branch_id } : {}),
    };
    try {
      await create.mutateAsync(input);
      methods.reset();
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
  const typeOptions = TX_TYPES.map((ty) => ({ value: ty, label: t(`inventory.txType.${ty}`) }));

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={t('inventory.addTransaction')}
        busy={create.isPending}
        onClose={onClose}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {create.error instanceof ApiError && !create.error.fieldErrors && (
          <Alert.Root status="error" rounded="md">
            <Alert.Indicator />
            <Alert.Title>{create.error.message}</Alert.Title>
          </Alert.Root>
        )}
        {isSuperAdmin && <FormSelect name="branch_id" label={t('cars.branch')} options={branchOptions} required />}
        <FormSelect name="material_id" label={t('inventory.materials')} options={materialOptions} required />
        <FormSelect name="type" label={t('inventory.txTypeLabel')} options={typeOptions} required />
        {type === 'transfer_out' && (
          <FormSelect name="destination_branch_id" label={t('inventory.destinationBranch')} options={branchOptions} required />
        )}
        <FormTextField name="quantity" label={t('inventory.quantity')} type="number" required />
        <FormTextField name="reference_id" label={t('inventory.referenceId')} />
        <FormTextField name="note" label={t('inventory.note')} multiline rows={2} />
        {type === 'transfer_out' && (
          <Text fontSize="sm" color="fgMuted">
            {t('inventory.transferOutNote')}
          </Text>
        )}
      </FormDialog>
    </FormProvider>
  );
}
