import { useEffect } from 'react';
import { Alert, Badge, Box, Button, Card, Stack } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PageHeader, FormTextField, ImageUploadField } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../api/types';
import { useUpdateProfile, type ProfileInput } from './api';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  image_url: z.any().optional(),
});
type FormValues = z.input<typeof schema>;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const update = useUpdateProfile();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', image_url: null },
  });

  useEffect(() => {
    if (user) {
      methods.reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        image_url: user.image_url ?? null,
      });
    }
  }, [user, methods]);

  const onSubmit = async (values: FormValues) => {
    update.reset();
    const input: ProfileInput = { name: values.name, email: values.email, phone: values.phone };
    if (values.image_url instanceof File) input.image_url = values.image_url;
    try {
      const updated = await update.mutateAsync(input);
      setUser(updated);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        Object.entries(e.fieldErrors).forEach(([field, messages]) =>
          methods.setError(field as keyof FormValues, { message: messages[0] }),
        );
      }
    }
  };

  const serverError = update.error;

  return (
    <Box>
      <PageHeader title={t('nav.profile')} />
      <Card.Root maxW="560px" w="full" mx="auto" bg="surface" borderColor="line">
        <Card.Body>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Stack gap={4}>
                {user && (
                  <Badge colorPalette="brand" alignSelf="flex-start" rounded="full" px={3} py={1}>
                    {t(`roles.${user.role}`)}
                  </Badge>
                )}
                {update.isSuccess && (
                  <Alert.Root status="success" rounded="md">
                    <Alert.Indicator />
                    <Alert.Title>{t('profile.saved')}</Alert.Title>
                  </Alert.Root>
                )}
                {serverError instanceof ApiError && !serverError.fieldErrors && (
                  <Alert.Root status="error" rounded="md">
                    <Alert.Indicator />
                    <Alert.Title>{serverError.message}</Alert.Title>
                  </Alert.Root>
                )}
                <ImageUploadField name="image_url" label={t('profile.avatar')} />
                <FormTextField name="name" label={t('admin.staffName')} required />
                <FormTextField name="email" label={t('auth.email')} type="email" required />
                <FormTextField name="phone" label={t('admin.phone')} />
                <Box>
                  <Button type="submit" colorPalette="brand" loading={update.isPending}>
                    {t('common.save')}
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
