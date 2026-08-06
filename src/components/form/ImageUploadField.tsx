import { useEffect, useMemo, useRef } from 'react';
import { Avatar, Button, Field, Flex } from '@chakra-ui/react';
import { MdCloudUpload, MdClose } from 'react-icons/md';
import { useController, useFormContext } from 'react-hook-form';

// Image picker wired to react-hook-form (Chakra). Value = File (new) | string (existing
// URL) | null. Must be inside a <FormProvider>.
export default function ImageUploadField({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const inputRef = useRef<HTMLInputElement>(null);

  const value = field.value as File | string | null | undefined;

  const preview = useMemo(() => {
    if (value instanceof File) return URL.createObjectURL(value);
    if (typeof value === 'string') return value;
    return undefined;
  }, [value]);

  useEffect(() => {
    return () => {
      if (value instanceof File && preview) URL.revokeObjectURL(preview);
    };
  }, [preview, value]);

  return (
    <Field.Root invalid={!!fieldState.error}>
      <Field.Label>{label}</Field.Label>
      <Flex align="center" gap={3}>
        <Avatar.Root shape="rounded" size="lg">
          <Avatar.Image src={preview} />
          <Avatar.Fallback />
        </Avatar.Root>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          <MdCloudUpload />
          {label}
        </Button>
        {value && (
          <Button variant="ghost" onClick={() => field.onChange(null)} aria-label="clear">
            <MdClose />
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
        />
      </Flex>
      <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
    </Field.Root>
  );
}
