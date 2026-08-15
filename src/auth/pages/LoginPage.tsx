import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, Field, Flex, Heading, Input, Stack, Text } from '@chakra-ui/react';
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

  // Translucent "glass" input, readable on the frosted card.
  const glassInput = {
    bg: 'whiteAlpha.100',
    borderColor: 'whiteAlpha.300',
    color: 'white',
    rounded: 'lg',
    _placeholder: { color: 'whiteAlpha.500' },
    _hover: { borderColor: 'whiteAlpha.400' },
    _focusVisible: { borderColor: 'white', boxShadow: '0 0 0 1px rgba(255,255,255,0.5)' },
  } as const;

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
        w="400px"
        maxW="100%"
        p={{ base: 6, md: 9 }}
        color="white"
        style={{
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(22px) saturate(130%)',
          WebkitBackdropFilter: 'blur(22px) saturate(130%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 30px 80px -24px rgba(0,0,0,0.7)',
          clipPath:
            'polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px))',
        }}
      >
        <Box mb={5} display="flex" justifyContent="center">
          <Logo height={92} />
        </Box>
        <Heading size="lg" mb={1} textAlign="center">
          {t('auth.login')}
        </Heading>
        <Text fontSize="sm" color="whiteAlpha.700" textAlign="center" mb={7}>
          {t('auth.welcomeBack')}
        </Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4}>
            {serverError && (
              <Alert.Root status="error" rounded="md">
                <Alert.Indicator />
                <Alert.Title>{serverError}</Alert.Title>
              </Alert.Root>
            )}
            <Field.Root invalid={!!formState.errors.email}>
              <Field.Label color="whiteAlpha.800">{t('auth.email')}</Field.Label>
              <Input type="email" {...register('email')} {...glassInput} />
              <Field.ErrorText>{formState.errors.email?.message}</Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!formState.errors.password}>
              <Field.Label color="whiteAlpha.800">{t('auth.password')}</Field.Label>
              <Input type="password" {...register('password')} {...glassInput} />
              <Field.ErrorText>{formState.errors.password?.message}</Field.ErrorText>
            </Field.Root>
            <Button
              type="submit"
              loading={formState.isSubmitting}
              mt={2}
              rounded="full"
              bg="white"
              color="#0b1220"
              fontWeight="700"
              _hover={{ bg: 'whiteAlpha.900' }}
            >
              {t('auth.login')}
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
