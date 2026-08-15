import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, Field, Flex, Heading, Input, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { Logo } from '../../components';
import { ApiError } from '../../api/types';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: Form) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate('/', { replace: true });
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Login failed');
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="appBg"
      backgroundImage="var(--brand-bg-grad)"
      backgroundAttachment="fixed"
      p={4}
    >
      <Box
        w="380px"
        maxW="100%"
        bg="surface"
        borderWidth="1px"
        borderColor="line"
        rounded="card"
        p={8}
        shadow="2xl"
      >
        <Box mb={6} display="flex" justifyContent="center">
          <Logo height={120} />
        </Box>
        <Heading size="md" color="fg" mb={6} textAlign="center">
          {t('auth.login')}
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4}>
            {serverError && (
              <Alert.Root status="error" rounded="md">
                <Alert.Indicator />
                <Alert.Title>{serverError}</Alert.Title>
              </Alert.Root>
            )}
            <Field.Root invalid={!!formState.errors.email}>
              <Field.Label color="fg">{t('auth.email')}</Field.Label>
              <Input type="email" {...register('email')} />
              <Field.ErrorText>{formState.errors.email?.message}</Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!formState.errors.password}>
              <Field.Label color="fg">{t('auth.password')}</Field.Label>
              <Input type="password" {...register('password')} />
              <Field.ErrorText>{formState.errors.password?.message}</Field.ErrorText>
            </Field.Root>
            <Button type="submit" colorPalette="brand" loading={formState.isSubmitting} mt={2}>
              {t('auth.login')}
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
