import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import type { CustomerUpdateInput } from './types';

// Edit-only — there's no "add customer" here, both Personal and Company customers
// self-register via /auth/register/*. Works for either tab: both share the exact same
// update payload (name/email/phone/password/is_active/image_url — the CustomerDTO shape).
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().optional(),
  is_active: z.boolean(),
}).refine((d) => !d.password || d.password.length >= 8, {
  path: ['password'],
  message: 'min8',
});
type FormValues = z.infer<typeof schema>;

interface EditableCustomer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
}

export default function CustomerFormDialog({
  open,
  customer,
  busy,
  error,
  onSubmit,
  onClose,
}: {
  open: boolean;
  customer: EditableCustomer | null;
  busy: boolean;
  error: unknown;
  onSubmit: (input: CustomerUpdateInput) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '', is_active: true },
  });

  useEffect(() => {
    if (open && customer) {
      methods.reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? '',
        password: '',
        is_active: customer.is_active,
      });
    }
  }, [open, customer, methods]);

  const handleSubmit = async (values: FormValues) => {
    const input: CustomerUpdateInput = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      is_active: values.is_active,
      ...(values.password ? { password: values.password } : {}),
    };
    try {
      await onSubmit(input);
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        Object.entries(e.fieldErrors).forEach(([field, messages]) =>
          methods.setError(field as keyof FormValues, { message: messages[0] }),
        );
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <FormDialog
        open={open}
        title={t('customers.edit')}
        busy={busy}
        onClose={onClose}
        onSubmit={methods.handleSubmit(handleSubmit)}
      >
        {error instanceof ApiError && !error.fieldErrors && (
          <Alert.Root status="error" rounded="md">
            <Alert.Indicator />
            <Alert.Title>{error.message}</Alert.Title>
          </Alert.Root>
        )}
        <FormTextField name="name" label={t('field.name')} required />
        <FormTextField name="email" label={t('auth.email')} type="email" required />
        <FormTextField name="phone" label={t('admin.phone')} />
        <FormTextField name="password" label={t('admin.newPasswordOptional')} type="password" />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
