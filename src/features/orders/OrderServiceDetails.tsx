import { useEffect, type ReactNode } from 'react';
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormTextField, FormSelect, Loader } from '../../components';
import { CAR_TYPE_SIZES } from '../../utils/enums';
import { ApiError } from '../../api/types';
import {
  useMaintenanceDetail,
  useRoadDetail,
  useTowingDetail,
  useUpdateMaintenanceDetail,
  useUpdateRoadDetail,
  useUpdateTowingDetail,
} from './api';

// A booking is exactly one of maintenance / road / towing, but the list row doesn't tell us
// which. Rather than guess, we show all three editors stacked; the operator fills whichever
// applies. Each GET returns the current detail or null, so an unused one just shows empty.
function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box borderWidth="1px" borderColor="line" rounded="card" p={5}>
      <Heading size="sm" fontWeight="700" mb={4}>
        {title}
      </Heading>
      {children}
    </Box>
  );
}

function useApplyFieldErrors() {
  return (e: unknown, setError: (n: string, v: { message: string }) => void) => {
    if (e instanceof ApiError && e.fieldErrors) {
      Object.entries(e.fieldErrors).forEach(([field, messages]) => setError(field, { message: messages[0] }));
    }
  };
}

function MaintenanceForm({ orderId }: { orderId: number }) {
  const { t } = useTranslation();
  const { data, isLoading } = useMaintenanceDetail(orderId);
  const update = useUpdateMaintenanceDetail();
  const applyErrors = useApplyFieldErrors();
  const methods = useForm({ defaultValues: { workshop_id: '', notes: '' } });

  useEffect(() => {
    methods.reset({ workshop_id: data?.workshop_id != null ? String(data.workshop_id) : '', notes: data?.notes ?? '' });
  }, [data, methods]);

  const onSubmit = methods.handleSubmit(async (v) => {
    const input = {
      workshop_id: v.workshop_id ? Number(v.workshop_id) : undefined,
      notes: v.notes || undefined,
    };
    try {
      await update.mutateAsync({ id: orderId, input });
    } catch (e) {
      applyErrors(e, (n, val) => methods.setError(n as never, val));
    }
  });

  if (isLoading) return <Loader />;
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <Stack gap={4}>
          <FormTextField name="workshop_id" label={t('orderDetail.workshopId')} type="number" />
          <FormTextField name="notes" label={t('orderDetail.notes')} multiline rows={3} />
          {update.isSuccess && <Text color="green.400" fontSize="sm">{t('orderDetail.detailSaved')}</Text>}
          <Button type="submit" colorPalette="brand" alignSelf="flex-start" loading={update.isPending}>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}

function RoadForm({ orderId }: { orderId: number }) {
  const { t } = useTranslation();
  const { data, isLoading } = useRoadDetail(orderId);
  const update = useUpdateRoadDetail();
  const applyErrors = useApplyFieldErrors();
  const methods = useForm({
    defaultValues: {
      problem_type_id: '', car_type_size: '', problem_description: '', problem_image_url: '', ai_diagnosis: '',
    },
  });

  useEffect(() => {
    methods.reset({
      problem_type_id: data?.problem_type_id != null ? String(data.problem_type_id) : '',
      car_type_size: data?.car_type_size ?? '',
      problem_description: data?.problem_description ?? '',
      problem_image_url: data?.problem_image_url ?? '',
      ai_diagnosis: data?.ai_diagnosis ?? '',
    });
  }, [data, methods]);

  const onSubmit = methods.handleSubmit(async (v) => {
    const input = {
      problem_type_id: v.problem_type_id ? Number(v.problem_type_id) : undefined,
      car_type_size: v.car_type_size || undefined,
      problem_description: v.problem_description || undefined,
      problem_image_url: v.problem_image_url || undefined,
      ai_diagnosis: v.ai_diagnosis || undefined,
    };
    try {
      await update.mutateAsync({ id: orderId, input });
    } catch (e) {
      applyErrors(e, (n, val) => methods.setError(n as never, val));
    }
  });

  if (isLoading) return <Loader />;
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <Stack gap={4}>
          <FormTextField name="problem_type_id" label={t('orderDetail.problemTypeId')} type="number" />
          <FormSelect
            name="car_type_size"
            label={t('orderDetail.carTypeSize')}
            options={CAR_TYPE_SIZES.map((s) => ({ value: s, label: t(`enums.carTypeSize.${s}`, { defaultValue: s }) }))}
          />
          <FormTextField name="problem_description" label={t('orderDetail.problemDescription')} multiline rows={2} />
          <FormTextField name="problem_image_url" label={t('orderDetail.problemImageUrl')} />
          <FormTextField name="ai_diagnosis" label={t('orderDetail.aiDiagnosis')} multiline rows={2} />
          {update.isSuccess && <Text color="green.400" fontSize="sm">{t('orderDetail.detailSaved')}</Text>}
          <Button type="submit" colorPalette="brand" alignSelf="flex-start" loading={update.isPending}>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}

function TowingForm({ orderId }: { orderId: number }) {
  const { t } = useTranslation();
  const { data, isLoading } = useTowingDetail(orderId);
  const update = useUpdateTowingDetail();
  const applyErrors = useApplyFieldErrors();
  const methods = useForm({
    defaultValues: { car_type_size: '', destination_lat: '', destination_lng: '', destination_address: '', notes: '' },
  });

  useEffect(() => {
    methods.reset({
      car_type_size: data?.car_type_size ?? '',
      destination_lat: data?.destination_lat != null ? String(data.destination_lat) : '',
      destination_lng: data?.destination_lng != null ? String(data.destination_lng) : '',
      destination_address: data?.destination_address ?? '',
      notes: data?.notes ?? '',
    });
  }, [data, methods]);

  const onSubmit = methods.handleSubmit(async (v) => {
    const input = {
      car_type_size: v.car_type_size || undefined,
      destination_lat: v.destination_lat !== '' ? Number(v.destination_lat) : undefined,
      destination_lng: v.destination_lng !== '' ? Number(v.destination_lng) : undefined,
      destination_address: v.destination_address || undefined,
      notes: v.notes || undefined,
    };
    try {
      await update.mutateAsync({ id: orderId, input });
    } catch (e) {
      applyErrors(e, (n, val) => methods.setError(n as never, val));
    }
  });

  if (isLoading) return <Loader />;
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <Stack gap={4}>
          <FormSelect
            name="car_type_size"
            label={t('orderDetail.carTypeSize')}
            options={CAR_TYPE_SIZES.map((s) => ({ value: s, label: t(`enums.carTypeSize.${s}`, { defaultValue: s }) }))}
          />
          <FormTextField name="destination_lat" label={t('orderDetail.destinationLat')} type="number" />
          <FormTextField name="destination_lng" label={t('orderDetail.destinationLng')} type="number" />
          <FormTextField name="destination_address" label={t('orderDetail.destinationAddress')} />
          <FormTextField name="notes" label={t('orderDetail.notes')} multiline rows={2} />
          {update.isSuccess && <Text color="green.400" fontSize="sm">{t('orderDetail.detailSaved')}</Text>}
          <Button type="submit" colorPalette="brand" alignSelf="flex-start" loading={update.isPending}>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}

export default function OrderServiceDetails({ orderId }: { orderId: number }) {
  const { t } = useTranslation();
  return (
    <Stack gap={5}>
      <DetailCard title={t('orderDetail.maintenance')}>
        <MaintenanceForm orderId={orderId} />
      </DetailCard>
      <DetailCard title={t('orderDetail.road')}>
        <RoadForm orderId={orderId} />
      </DetailCard>
      <DetailCard title={t('orderDetail.towing')}>
        <TowingForm orderId={orderId} />
      </DetailCard>
    </Stack>
  );
}
