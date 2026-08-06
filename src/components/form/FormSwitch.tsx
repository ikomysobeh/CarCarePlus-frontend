import { Switch } from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';

// Boolean on/off toggle wired to react-hook-form (Chakra). Must be inside a <FormProvider>.
export default function FormSwitch({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });

  return (
    <Switch.Root
      checked={!!field.value}
      onCheckedChange={(e) => field.onChange(e.checked)}
      colorPalette="brand"
    >
      <Switch.HiddenInput onBlur={field.onBlur} name={field.name} />
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>{label}</Switch.Label>
    </Switch.Root>
  );
}
