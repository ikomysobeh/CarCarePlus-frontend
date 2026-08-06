import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSelect, FormSwitch, ImageUploadField } from '../../components';
import { ApiError } from '../../api/types';
import { FUEL_TYPES } from '../../utils/enums';
import { useBranches } from '../branches/api';
import { useCarBrands, useCarTypes } from '../catalog/api';
import { useCreateCar, useUpdateCar } from './api';
import type { Car, CarInput } from './types';

const emptyToUndef = (v: unknown) => (v === '' || v === null ? undefined : v);
const currentYear = new Date().getFullYear();

const schema = z.object({
  customer_id: z.coerce.number().min(1),
  brand_id: z.coerce.number().min(1),
  car_type_id: z.coerce.number().min(1),
  branch_id: z.coerce.number().min(1),
  plate_number: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1900).max(currentYear),
  color: z.string().min(1),
  fuel_type: z.enum(FUEL_TYPES),
  cylinders: z.preprocess(emptyToUndef, z.coerce.number().min(1).max(16).optional()),
  mileage: z.preprocess(emptyToUndef, z.coerce.number().min(0).optional()),
  is_active: z.boolean(),
  image: z.any().optional(),
});
type FormValues = z.input<typeof schema>;

export default function CarFormDialog({
  open,
  car,
  onClose,
}: {
  open: boolean;
  car: Car | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const brands = useCarBrands();
  const types = useCarTypes();
  const branches = useBranches();
  const create = useCreateCar();
  const update = useUpdateCar();
  const isEdit = !!car;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: '', brand_id: '', car_type_id: '', branch_id: '',
      plate_number: '', model: '', year: '', color: '', fuel_type: 'petrol',
      cylinders: '', mileage: '', is_active: true, image: null,
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        customer_id: car?.user_id ?? '',
        brand_id: car?.brand_id ?? '',
        car_type_id: car?.car_type_id ?? '',
        branch_id: car?.branch_id ?? '',
        plate_number: car?.plate_number ?? '',
        model: car?.model ?? '',
        year: car?.year ?? '',
        color: car?.color ?? '',
        fuel_type: car?.fuel_type ?? 'petrol',
        cylinders: car?.cylinders ?? '',
        mileage: car?.mileage ?? '',
        is_active: car?.is_active ?? true,
        image: car?.image_url ?? null,
      });
    }
  }, [open, car, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    const v = schema.parse(values);
    const input: CarInput = {
      brand_id: v.brand_id, car_type_id: v.car_type_id, branch_id: v.branch_id,
      plate_number: v.plate_number, model: v.model, year: v.year, color: v.color,
      fuel_type: v.fuel_type, cylinders: v.cylinders, mileage: v.mileage, is_active: v.is_active,
    };
    if (v.image instanceof File) input.image = v.image;
    try {
      if (car) await update.mutateAsync({ id: car.id, input });
      else await create.mutateAsync({ customerId: v.customer_id, input });
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
  const typeOptions = types.data?.map((ct) => ({ value: ct.id, label: ct.name_ar })) ?? [];
  const branchOptions = branches.data?.map((b) => ({ value: b.id, label: b.name_ar })) ?? [];
  const fuelOptions = FUEL_TYPES.map((f) => ({ value: f, label: t(`enums.fuel.${f}`) }));

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={car ? t('cars.edit') : t('cars.add')}
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
        {!isEdit && <FormTextField name="customer_id" label={t('cars.customerId')} type="number" required />}
        <FormSelect name="brand_id" label={t('cars.brand')} options={brandOptions} required />
        <FormSelect name="car_type_id" label={t('cars.carType')} options={typeOptions} required />
        <FormSelect name="branch_id" label={t('cars.branch')} options={branchOptions} required />
        <FormTextField name="plate_number" label={t('cars.plateNumber')} required />
        <FormTextField name="model" label={t('cars.model')} required />
        <FormTextField name="year" label={t('cars.year')} type="number" required />
        <FormTextField name="color" label={t('cars.color')} required />
        <FormSelect name="fuel_type" label={t('cars.fuelType')} options={fuelOptions} required />
        <FormTextField name="cylinders" label={t('cars.cylinders')} type="number" />
        <FormTextField name="mileage" label={t('cars.mileage')} type="number" />
        <FormSwitch name="is_active" label={t('field.active')} />
        <ImageUploadField name="image" label={t('cars.image')} />
      </FormDialog>
    </FormProvider>
  );
}
