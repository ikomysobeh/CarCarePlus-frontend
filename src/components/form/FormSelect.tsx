import { Field, NativeSelect } from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

export interface SelectOption {
  value: string | number;
  label: string;
}

// Dropdown wired to react-hook-form (Chakra NativeSelect = a real <select>, easy to test).
// Must be inside a <FormProvider>. Send the value, show the label.
export default function FormSelect({
  name,
  label,
  options,
  required,
}: {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
}) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <Field.Root invalid={!!fieldState.error} required={required}>
      <Field.Label color="fgMuted" fontSize="sm" fontWeight="600">
        {label}
      </Field.Label>
      <NativeSelect.Root>
        <NativeSelect.Field
          {...field}
          value={field.value ?? ''}
          bg="surface"
          borderColor="line"
          rounded="lg"
          _hover={{ borderColor: 'fgMuted' }}
          _focusVisible={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--ccp-colors-brand-500)' }}
        >
          <option value="" hidden></option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
    </Field.Root>
  );
}
