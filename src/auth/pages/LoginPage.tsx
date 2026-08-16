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

  // Inputs on the frosted card are glass too, not solid boxes — a solid field would punch an
  // opaque hole through the panel and break the illusion. They are translucent white, so they
  // read as lighter panes set INTO the glass. Values come from the --glass-* vars in
  // theme/system.ts; the card never follows the colour mode (it always sits on the blue
  // gradient), so these are fixed rather than tokenised per mode.
  const cardInput = {
    bg: 'rgba(255,255,255,0.08)',
    borderColor: 'var(--glass-border)',
    color: '#FFFFFF',
    rounded: 'lg',
    _placeholder: { color: 'rgba(255,255,255,0.45)' },
    _hover: { borderColor: 'rgba(255,255,255,0.30)' },
    _focusVisible: {
      borderColor: 'brand.400',
      boxShadow: '0 0 0 1px var(--ccp-colors-brand-400)',
      bg: 'rgba(255,255,255,0.12)',
    },
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
        position="relative"
        w="400px"
        maxW="100%"
        p={{ base: 6, md: 9 }}
        color="#FFFFFF"
        // The grain layer. It has to be a pseudo-element rather than a background on the card
        // itself, because the card's own background is the translucent tint — stacking the
        // noise there would tint the noise instead of overlaying it. `soft-light` lets the
        // grain darken and lighten the panel unevenly, which is what real frosted glass does;
        // a plain low-opacity overlay just greys the whole surface.
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'var(--glass-noise)',
          opacity: 0.35,
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
        }}
        style={{
          background: 'var(--glass-bg)',
          // Heavier blur than before (22 -> 30): the card is far more transparent now, so the
          // gradient behind it needs more diffusion or it reads as a dirty window.
          backdropFilter: 'blur(30px) saturate(160%)',
          WebkitBackdropFilter: 'blur(30px) saturate(160%)',
          border: '1px solid var(--glass-border)',
          // Outer drop shadow lifts the card off the gradient; the inset hairline along the top
          // is the light catching the pane's edge — without it the panel looks printed on.
          boxShadow:
            '0 30px 80px -24px rgba(3,7,18,0.75), inset 0 1px 0 var(--glass-highlight)',
          clipPath:
            'polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px))',
        }}
      >
        <Box mb={4} display="flex" justifyContent="center" position="relative">
          {/* The card is dark glass in BOTH colour modes, so the logo must not follow the
              mode here — `onDark` pins the white-ink palette. */}
          <Logo height={132} tone="onDark" />
        </Box>
        <Heading size="lg" mb={1} textAlign="center" color="#FFFFFF" position="relative">
          {t('auth.login')}
        </Heading>
        <Text
          fontSize="sm"
          color="rgba(255,255,255,0.62)"
          textAlign="center"
          mb={7}
          position="relative"
        >
          {t('auth.welcomeBack')}
        </Text>
        {/* `position: relative` on the form keeps it above the ::before grain layer. */}
        <Box as="form" position="relative" onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4}>
            {serverError && (
              <Alert.Root status="error" rounded="md">
                <Alert.Indicator />
                <Alert.Title>{serverError}</Alert.Title>
              </Alert.Root>
            )}
            <Field.Root invalid={!!formState.errors.email}>
              <Field.Label color="rgba(255,255,255,0.78)">{t('auth.email')}</Field.Label>
              <Input type="email" {...register('email')} {...cardInput} />
              <Field.ErrorText>{formState.errors.email?.message}</Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!formState.errors.password}>
              <Field.Label color="rgba(255,255,255,0.78)">{t('auth.password')}</Field.Label>
              <Input type="password" {...register('password')} {...cardInput} />
              <Field.ErrorText>{formState.errors.password?.message}</Field.ErrorText>
            </Field.Root>
            <Button
              type="submit"
              loading={formState.isSubmitting}
              mt={2}
              rounded="full"
              bg="#0066FF"
              color="white"
              fontWeight="700"
              _hover={{ bg: '#0052CC' }}
            >
              {t('auth.login')}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
}
