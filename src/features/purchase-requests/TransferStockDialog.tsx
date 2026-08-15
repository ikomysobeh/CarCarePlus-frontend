import { useEffect } from 'react';
import { Alert, Box, Button, Flex, IconButton, Text } from '@chakra-ui/react';
import { MdAdd, MdDelete } from 'react-icons/md';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect } from '../../components';
import { ApiError } from '../../api/types';
import { useMaterials } from '../inventory/api';
import { useBranches } from '../branches/api';
import { useTransferStock } from './api';

const schema = z
  .object({
    from_branch_id: z.coerce.number().min(1),
    to_branch_id: z.coerce.number().min(1),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          material_id: z.coerce.number().min(1),
          quantity: z.coerce.number().min(0.01),
        }),
      )
      .min(1),
  })
  .refine((v) => v.from_branch_id !== v.to_branch_id, {
    path: ['to_branch_id'],
    message: 'from/to must differ',
  });
type FormValues = z.input<typeof schema>;

const EMPTY_ITEM = { material_id: '', quantity: '' };

export default function TransferStockDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const materials = useMaterials();
  const branches = useBranches();
  const transfer = useTransferStock();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { from_branch_id: '', to_branch_id: '', notes: '', items: [{ ...EMPTY_ITEM }] },
  });
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: 'items' });

  useEffect(() => {
    if (open) methods.reset({ from_branch_id: '', to_branch_id: '', notes: '', items: [{ ...EMPTY_ITEM }] });
  }, [open, methods]);

  const materialOptions = materials.data?.map((m) => ({ value: m.id, label: m.name_ar })) ?? [];
  const branchOptions = branches.data?.map((b) => ({ value: b.id, label: b.name_ar })) ?? [];

  const onSubmit = async (values: FormValues) => {
    const v = schema.parse(values);
    try {
      await transfer.mutateAsync(v);
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        Object.entries(e.fieldErrors).forEach(([field, messages]) =>
          methods.setError(field as never, { message: messages[0] }),
        );
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={t('purchaseRequests.transferTitle')}
        busy={transfer.isPending}
        onClose={onClose}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {transfer.error instanceof ApiError && !transfer.error.fieldErrors && (
          <Alert.Root status="error" rounded="md">
            <Alert.Indicator />
            <Alert.Title>{transfer.error.message}</Alert.Title>
          </Alert.Root>
        )}
        <Text color="fgMuted" fontSize="sm">
          {t('purchaseRequests.transferHint')}
        </Text>
        <FormSelect name="from_branch_id" label={t('purchaseRequests.fromBranch')} options={branchOptions} required />
        <FormSelect name="to_branch_id" label={t('purchaseRequests.toBranch')} options={branchOptions} required />
        <FormTextField name="notes" label={t('purchaseRequests.notes')} multiline rows={2} />

        <Text fontSize="sm" fontWeight="700" color="fgMuted">
          {t('purchaseRequests.items')}
        </Text>
        {fields.map((f, i) => (
          <Box key={f.id} borderWidth="1px" borderColor="line" rounded="lg" p={3}>
            <Flex justify="flex-end" mb={1}>
              <IconButton
                aria-label={t('common.delete')}
                size="xs"
                variant="ghost"
                colorPalette="red"
                disabled={fields.length === 1}
                onClick={() => remove(i)}
              >
                <MdDelete />
              </IconButton>
            </Flex>
            <FormSelect name={`items.${i}.material_id`} label={t('purchaseRequests.material')} options={materialOptions} required />
            <Box mt={2}>
              <FormTextField name={`items.${i}.quantity`} label={t('purchaseRequests.quantity')} type="number" required />
            </Box>
          </Box>
        ))}
        <Button variant="outline" size="sm" onClick={() => append({ ...EMPTY_ITEM })}>
          <MdAdd /> {t('purchaseRequests.addItem')}
        </Button>
      </FormDialog>
    </FormProvider>
  );
}
