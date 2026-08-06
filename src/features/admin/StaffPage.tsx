import { Alert, Box, Button, Card, Stack } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PageHeader, FormTextField, FormSelect, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { EMPLOYEE_TYPES } from '../../utils/enums';
import { useBranches } from '../branches/api';
import { useCreateStaff } from './api';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  password: z.string().min(8),
  branch_id: z.coerce.number().min(1),
  type: z.enum(EMPLOYEE_TYPES),
  is_active: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export default function StaffPage() {
  const { t } = useTranslation();
  const create = useCreateStaff();
  const branches = useBranches();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '', branch_id: '', type: 'washer', is_active: true },
  });

  const onSubmit = async (values: FormValues) => {
    create.reset();
    try {
      await create.mutateAsync(schema.parse(values));
      methods.reset();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        Object.entries(e.fieldErrors).forEach(([field, messages]) =>
          methods.setError(field as keyof FormValues, { message: messages[0] }),
        );
      }
    }
  };

  const branchOptions = branches.data?.map((b) => ({ value: b.id, label: b.name_ar })) ?? [];
  const typeOptions = EMPLOYEE_TYPES.map((ty) => ({ value: ty, label: t(`admin.staffType.${ty}`) }));
  const serverError = create.error;

  return (
    <Box>
      <PageHeader title={t('nav.staff')} subtitle={t('admin.staffHint')} />
      <Card.Root maxW="560px" w="full" mx="auto" bg="surface" borderColor="line">
        <Card.Body>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Stack gap={4}>
                {create.isSuccess && (
                  <Alert.Root status="success" rounded="md">
                    <Alert.Indicator />
                    <Alert.Title>{t('admin.staffCreated')}</Alert.Title>
                  </Alert.Root>
                )}
                {serverError instanceof ApiError && !serverError.fieldErrors && (
                  <Alert.Root status="error" rounded="md">
                    <Alert.Indicator />
                    <Alert.Title>{serverError.message}</Alert.Title>
                  </Alert.Root>
                )}
                <FormTextField name="name" label={t('admin.staffName')} required />
                <FormTextField name="email" label={t('auth.email')} type="email" required />
                <FormTextField name="phone" label={t('admin.phone')} required />
                <FormTextField name="password" label={t('auth.password')} type="password" required />
                <FormSelect name="branch_id" label={t('cars.branch')} options={branchOptions} required />
                <FormSelect name="type" label={t('admin.staffTypeLabel')} options={typeOptions} required />
                <FormSwitch name="is_active" label={t('field.active')} />
                <Box>
                  <Button type="submit" colorPalette="brand" loading={create.isPending}>
                    {t('admin.createStaff')}
                  </Button>
                </Box>
              </Stack>
            </form>
          </FormProvider>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
