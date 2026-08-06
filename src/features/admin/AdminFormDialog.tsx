import { useEffect } from 'react';
import { Alert } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FormDialog, FormTextField, FormSwitch } from '../../components';
import { ApiError } from '../../api/types';
import { useCreateAdmin, useUpdateAdmin } from './api';
import type { Admin } from './types';

// Password is required on create, optional on edit ("leave blank to keep the current one").
// The backend's `confirmed` rule needs a matching password_confirmation when password is set.
const schema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
    is_active: z.boolean(),
    // image_url here is a plain URL string (this endpoint is NOT multipart — see docs/09).
    image_url: z.string().optional(),
  })
  .refine((d) => !d.password || d.password.length >= 8, {
    path: ['password'],
    message: 'min8',
  })
  .refine((d) => !d.password || d.password === d.password_confirmation, {
    path: ['password_confirmation'],
    message: 'mismatch',
  });
type FormValues = z.infer<typeof schema>;

export default function AdminFormDialog({
  open,
  admin,
  onClose,
}: {
  open: boolean;
  admin: Admin | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateAdmin();
  const update = useUpdateAdmin();
  const isEdit = !!admin;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', email: '', phone: '', password: '', password_confirmation: '',
      is_active: true, image_url: '',
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: admin?.name ?? '',
        email: admin?.email ?? '',
        phone: admin?.phone ?? '',
        password: '',
        password_confirmation: '',
        is_active: admin?.is_active ?? true,
        image_url: admin?.image_url ?? '',
      });
    }
  }, [open, admin, methods]);

  const serverError = (create.error ?? update.error) as unknown;
  const busy = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    // On edit, an empty password means "don't change it" so we omit it entirely. When a
    // password IS sent, Laravel's `confirmed` rule needs `password_confirmation` in the
    // request body too (not just checked client-side) — so send both together.
    const input = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      is_active: values.is_active,
      image_url: values.image_url,
      ...(values.password
        ? { password: values.password, password_confirmation: values.password_confirmation }
        : {}),
    };
    try {
      if (admin) await update.mutateAsync({ id: admin.id, input });
      else await create.mutateAsync(input);
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
        title={admin ? t('admin.editAdmin') : t('admin.addAdmin')}
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
        <FormTextField name="name" label={t('admin.staffName')} required />
        <FormTextField name="email" label={t('auth.email')} type="email" required />
        <FormTextField name="phone" label={t('admin.phone')} />
        <FormTextField
          name="password"
          label={isEdit ? t('admin.newPasswordOptional') : t('auth.password')}
          type="password"
          required={!isEdit}
        />
        <FormTextField
          name="password_confirmation"
          label={t('admin.confirmPassword')}
          type="password"
          required={!isEdit}
        />
        <FormTextField name="image_url" label={t('admin.imageUrl')} />
        <FormSwitch name="is_active" label={t('field.active')} />
      </FormDialog>
    </FormProvider>
  );
}
