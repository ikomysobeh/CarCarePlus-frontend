# `src/components/ConfirmDialog.tsx` — the yes/no modal

**Real file:** [`../../../src/components/ConfirmDialog.tsx`](../../../src/components/ConfirmDialog.tsx)

## What it is

A reusable confirmation popup for **risky/irreversible** actions — delete a category, reject a
company, etc. The parent decides when it's open and what happens on confirm; the dialog just
renders the question and the two buttons.

**Laravel analogy:** like a `<x-confirm-modal>` Blade component — dumb UI you reuse, with the
real action wired by the caller.

## The "controlled component" pattern (important React concept)

This dialog holds **no state of its own** about whether it's open. The **parent** owns that:
```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Delete</Button>

<ConfirmDialog
  open={open}
  title={t('catalog.deleteTitle')}
  message={t('catalog.deleteMsg')}
  destructive
  loading={deleteMutation.isPending}
  onConfirm={() => deleteMutation.mutate(id)}
  onClose={() => setOpen(false)}
/>
```
This is called a **controlled component**: the parent passes the value (`open`) *in*, and gets
change events (`onClose`) *out*. The child never flips its own visibility. You saw the same idea
on the login inputs — value in, change out. It keeps the single source of truth in the parent.

## The props
```ts
open: boolean;            // parent controls visibility
title: string;
message?: string;
confirmText?: string;     // defaults to t('common.confirm')
cancelText?: string;      // defaults to t('common.cancel')
destructive?: boolean;    // makes the confirm button red
loading?: boolean;        // disables buttons + shows work in progress
onConfirm: () => void;    // what to do on "yes"
onClose: () => void;      // close without acting
```

## Block by block
- `<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>` — MUI's modal. Clicking the
  backdrop or pressing Esc calls `onClose`.
- `<DialogTitle>` / `<DialogContent>` — the question. The message is optional.
- `<DialogActions>` — two buttons:
  - Cancel → `onClose`, disabled while `loading`.
  - Confirm → `onConfirm`, `color={destructive ? 'error' : 'primary'}` (red for deletes),
    disabled while `loading` so the user can't double-click during the request.

## Why `loading` matters

When you confirm a delete, the API call takes a moment. `loading` (wired to React Query's
`mutation.isPending`) disables both buttons so the user can't fire the action twice or close
mid-request. The parent usually closes the dialog in the mutation's `onSuccess`.

## When you'll touch this file

Rarely. It already covers delete/reject/approve confirmations. You mostly just render it with
different `title`/`message`/`onConfirm`.
