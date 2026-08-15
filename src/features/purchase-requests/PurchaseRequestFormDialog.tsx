import { useEffect } from 'react';
import { Alert, Box, Button, Flex, HStack, IconButton, Text } from '@chakra-ui/react';
import { MdAdd, MdDelete } from 'react-icons/md';
import { FormProvider, useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect } from '../../components';
import { ApiError } from '../../api/types';
import { useMaterials } from '../inventory/api';
import { useCreatePurchaseRequest, useUpdatePurchaseRequest } from './api';
import type { PurchaseRequest } from './types';

const schema = z.object({
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        material_id: z.coerce.number().min(1),
        quantity: z.coerce.number().min(0.01),
        unit_price: z.coerce.number().min(0),
      }),
    )
    .min(1),
});
type FormValues = z.input<typeof schema>;

const EMPTY_ITEM = { material_id: '', quantity: '', unit_price: '' };

// Running total shown under the items list. Reads live form values via useWatch.
function ItemsTotal() {
  const { t } = useTranslation();
  const items = useWatch({ name: 'items' }) as FormValues['items'] | undefined;
  const total = (items ?? []).reduce(
    (sum, it) => sum + (Number(it?.quantity) || 0) * (Number(it?.unit_price) || 0),
    0,
  );
  return (
    <Flex justify="space-between" pt={2} borderTopWidth="1px" borderColor="line">
      <Text color="fgMuted" fontSize="sm" fontWeight="600">
        {t('purchaseRequests.total')}
      </Text>
      <Text fontWeight="800">
        {total.toFixed(2)} {t('common.sar')}
      </Text>
    </Flex>
  );
}

export default function PurchaseRequestFormDialog({
  open,
  request,
  onClose,
}: {
  open: boolean;
  request: PurchaseRequest | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const materials = useMaterials();
  const create = useCreatePurchaseRequest();
  const update = useUpdatePurchaseRequest();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { notes: '', items: [{ ...EMPTY_ITEM }] },
  });
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: 'items' });

  useEffect(() => {
    if (open) {
      methods.reset({
        notes: request?.notes ?? '',
        items: request?.items?.length
          ? request.items.map((it) => ({
              material_id: it.material_id,
              quantity: it.quantity,
              unit_price: Number(it.unit_price),
            }))
          : [{ ...EMPTY_ITEM }],
      });
    }
  }, [open, request, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;
  const materialOptions = materials.data?.map((m) => ({ value: m.id, label: m.name_ar })) ?? [];

  const onSubmit = async (values: FormValues) => {
    const v = schema.parse(values);
    try {
      if (request) await update.mutateAsync({ id: request.id, input: v });
      else await create.mutateAsync(v);
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
        title={request ? t('purchaseRequests.edit') : t('purchaseRequests.add')}
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
            <HStack gap={3} align="flex-start" mt={2}>
              <Box flex="1">
                <FormTextField name={`items.${i}.quantity`} label={t('purchaseRequests.quantity')} type="number" required />
              </Box>
              <Box flex="1">
                <FormTextField name={`items.${i}.unit_price`} label={t('purchaseRequests.unitPrice')} type="number" required />
              </Box>
            </HStack>
          </Box>
        ))}

        <Button variant="outline" size="sm" onClick={() => append({ ...EMPTY_ITEM })}>
          <MdAdd /> {t('purchaseRequests.addItem')}
        </Button>

        <ItemsTotal />
      </FormDialog>
    </FormProvider>
  );
}
