# Form fields (`src/components/form/`) — the FormProvider pattern

**Added in M2.** Four inputs pre-wired to **react-hook-form**, so building a form is just
listing fields. Files: `FormTextField.tsx`, `FormSelect.tsx`, `FormSwitch.tsx`,
`ImageUploadField.tsx`.

**Laravel analogy:** these are like `<x-form.input name="email" />` Blade components that already
know how to bind to the form and show the field's validation error — you just name them.

---

## The key idea: `FormProvider` + `useFormContext`

On the **login page** we wired each input by hand with `{...register('email')}`. That's fine for
2 fields. For bigger forms it's repetitive. So our shared fields use a cleaner pattern:

1. The **form component** creates the form and wraps its fields in a `<FormProvider>`:
   ```tsx
   const methods = useForm({ resolver: zodResolver(schema), defaultValues });
   return (
     <FormProvider {...methods}>
       <form onSubmit={methods.handleSubmit(onSubmit)}>
         <FormTextField name="name" label={t('field.name')} />
         <FormSelect name="category_id" label={t('field.category')} options={cats} />
         <FormSwitch name="is_active" label={t('field.active')} />
       </form>
     </FormProvider>
   );
   ```
2. Each **field** grabs the form from context — no need to pass `control` down every time:
   ```tsx
   const { control } = useFormContext();
   const { field, fieldState } = useController({ name, control });
   ```

**`useFormContext()`** is react-hook-form's version of a Context (like our `useAuth()`): it hands
any field the shared form instance created by the nearest `<FormProvider>` above it.

**`useController({ name, control })`** connects one field to the form and returns:
- `field` — `{ value, onChange, onBlur, name, ref }` to spread onto the input.
- `fieldState` — `{ error, ... }` so the field can show its own validation message.

Result: adding a field to a form is **one line**, and validation wiring is automatic.

---

## The four fields

### `FormTextField.tsx`
```tsx
<FormTextField name="email" label="Email" type="email" />
<FormTextField name="description" label="Description" multiline rows={3} />
```
- `{...field}` spreads value/onChange/etc. onto MUI's `<TextField>`.
- `value={field.value ?? ''}` — coerce null/undefined to `''` so the input stays **controlled**
  (React warns if a value flips between undefined and a string).
- `error` + `helperText` show the validation message under the field.

### `FormSelect.tsx`
```tsx
<FormSelect name="category_id" label="Category" options={[{ value: 1, label: 'Wash' }]} />
```
- A dropdown using MUI's `select` TextField. `options` are `{ value, label }` — **send the
  value, show the label** (same rule as enums: store the raw value, display a localized label).

### `FormSwitch.tsx`
```tsx
<FormSwitch name="is_active" label="Active" />
```
- A boolean on/off toggle for flags like `is_active`, `is_vip_available`.
- Note it uses `checked={!!field.value}` and `onChange={e => field.onChange(e.target.checked)}`
  — a switch reports a boolean, not text, so we adapt it to the form field.

### `ImageUploadField.tsx`
```tsx
<ImageUploadField name="image" label={t('field.image')} />
```
- The field value can be **a `File`** (newly picked), **a string** (existing image URL from the
  backend), or **null**. This matches how our API works: it returns image URLs, and accepts a new
  file via `multipart/form-data`.
- It shows a preview (`<Avatar>`), a pick button (a hidden `<input type="file">` triggered by a
  styled button), and a clear button.
- `URL.createObjectURL(file)` makes a temporary preview URL for a picked file; we
  `URL.revokeObjectURL(...)` in a `useEffect` cleanup to avoid memory leaks.
- When the form submits, the screen builds `FormData` and appends this `File` (see the cars/
  profile screens later).

---

## Why this matters for the whole project

Every create/edit screen (catalog, cars, staff, profile) is now: a **zod schema** (rules) +
a `<FormProvider>` + a few of these fields + an `onSubmit` that calls the API. Consistent,
short, and validated. This is the form half of our screen recipe (the data half is React Query,
taught in M3).

## When you'll touch these

When a form needs an input type we don't have yet (date picker, multi-select, number stepper) —
add it here as another `Form*` field, and every future form can use it.
