import { Field, Input, Textarea } from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

// Text input wired to react-hook-form (Chakra). Must be inside a <FormProvider>.
export default function FormTextField({
  name,
  label,
  type = 'text',
  multiline,
  rows,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  // Shared look for the input/textarea: rounded, surface bg, subtle hover, brand focus ring.
  const fieldStyles = {
    bg: 'surface',
    borderColor: 'line',
    rounded: 'lg',
    _hover: { borderColor: 'fgMuted' },
    _focusVisible: {
      borderColor: 'brand.500',
      boxShadow: '0 0 0 1px var(--ccp-colors-brand-500)',
    },
  } as const;

  return (
    <Field.Root invalid={!!fieldState.error} required={required}>
      <Field.Label color="fgMuted" fontSize="sm" fontWeight="600">
        {label}
      </Field.Label>
      {multiline ? (
        <Textarea {...field} value={field.value ?? ''} rows={rows} {...fieldStyles} />
      ) : (
        <Input {...field} value={field.value ?? ''} type={type} {...fieldStyles} />
      )}
      <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
    </Field.Root>
  );
}
