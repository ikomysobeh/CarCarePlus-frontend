# `src/auth/pages/LoginPage.tsx` — the login screen (a full example)

**Real file:** [`../../../../src/auth/pages/LoginPage.tsx`](../../../../src/auth/pages/LoginPage.tsx)

> This is the **first complete, real screen** in the app. Study it — every future form
> screen (create car, add service, create staff...) follows this exact pattern.

## What it is

A login form that: validates input in the browser, calls `login()` from our auth context,
shows server errors, and redirects to the dashboard on success.

## The pattern it demonstrates (memorize this)

**`react-hook-form` + `zod` + our `useAuth()`** — this trio is how we do every form:
- **zod** = the validation schema (like a Laravel **FormRequest** `rules()`).
- **react-hook-form** = manages the input values + validation + submit (less boilerplate).
- **useAuth()/API call** = the actual submit action.

## Block by block

### The validation schema (zod)
```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Form = z.infer<typeof schema>;
```
- `z.object({...})` describes valid input: `email` must be a valid email, `password` at
  least 1 char. This is your **FormRequest rules**, but it runs in the browser.
- `z.infer<typeof schema>` — auto-generates the TypeScript type `Form = { email: string;
  password: string }` from the schema, so you never write the shape twice.

### Setting up the component
```tsx
const { t } = useTranslation();
const { login } = useAuth();
const navigate = useNavigate();
const [serverError, setServerError] = useState<string | null>(null);
```
- `t` = the translate function → `t('auth.login')` returns "Login"/"تسجيل الدخول" depending
  on language (like Laravel `__('auth.login')`). See [`../../i18n/index.ts.md`](../../i18n/index.ts.md).
- `login` = the action from our auth context.
- `navigate` = programmatic redirect (`navigate('/')` = `redirect('/')`).
- `serverError` = state to hold an error message coming back from the API (e.g. wrong
  password), shown in a red alert.

### Wiring the form
```tsx
const { register, handleSubmit, formState } = useForm<Form>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
});
```
- `useForm` gives us:
  - `register('email')` — connects an input to the form (tracks its value + validation).
  - `handleSubmit(fn)` — wraps our submit function; it validates first, and only calls `fn`
    if the input passes the zod schema.
  - `formState` — info about the form: `formState.errors` (validation messages),
    `formState.isSubmitting` (true while submitting → disable the button).
- `resolver: zodResolver(schema)` — tells the form to validate using our zod schema.

### The submit handler
```tsx
const onSubmit = async (values: Form) => {
  setServerError(null);
  try {
    await login(values.email, values.password);
    navigate('/', { replace: true });
  } catch (e) {
    setServerError(e instanceof ApiError ? e.message : 'Login failed');
  }
};
```
- Runs only if client validation passed. Clears any old error.
- `await login(...)` — calls the API through our auth context.
- On success → `navigate('/')` to the dashboard.
- On failure → the API layer threw an `ApiError`; we catch it and show its `.message`
  (e.g. "Invalid credentials"). `e instanceof ApiError` checks the error type before
  reading its message.

### The JSX (the visible form)
```tsx
return (
  <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', p: 2 }}>
    <Card sx={{ width: 380, maxWidth: '100%' }}>
      <CardContent>
        <Typography variant="h5">{t('auth.login')}</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField
              label={t('auth.email')}
              type="email"
              {...register('email')}
              error={!!formState.errors.email}
              helperText={formState.errors.email?.message}
              fullWidth
            />
            {/* password field is the same pattern */}
            <Button type="submit" variant="contained" disabled={formState.isSubmitting}>
              {t('auth.login')}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  </Box>
);
```
Key things to understand:
- `<Box>`, `<Card>`, `<TextField>`, `<Button>`, `<Stack>` are **MUI components** — ready-made
  styled UI pieces (like a Blade component kit). `<Stack spacing={2}>` stacks children with
  gaps between them.
- `<form onSubmit={handleSubmit(onSubmit)}>` — on submit, validate then run `onSubmit`.
- `{...register('email')}` — the `...` spreads the props react-hook-form needs onto the
  input to connect it (value, onChange, name, ref). This one line wires the field.
- `{serverError && <Alert>...</Alert>}` — a common React idiom: "if `serverError` is truthy,
  render the Alert; otherwise render nothing." It's an inline `@if`.
- `error={!!formState.errors.email}` — mark the field red if it has a validation error.
  `!!` converts a value to a real boolean.
- `helperText={formState.errors.email?.message}` — show the validation message under the input.
- `disabled={formState.isSubmitting}` — grey out the button while the request is in flight,
  preventing double submits.

## The mental model for ALL our forms

```
zod schema (rules)  →  useForm (state + validation)  →  onSubmit (API call)  →  success redirect / catch → show error
```
Every create/edit screen we build reuses this skeleton. When we build the "Add Car" form,
open this file side by side — it's the same shape with more fields.

## When you'll touch this file

We'll extend it soon: add a "Forgot password?" link, and possibly show field errors coming
from the API's 422 (`ApiError.fieldErrors`) using react-hook-form's `setError`. But the
core structure stays.
