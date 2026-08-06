# Profile feature (`src/features/profile/`)

**Real files:** [`api.ts`](../../../../src/features/profile/api.ts),
[`ProfilePage.tsx`](../../../../src/features/profile/ProfilePage.tsx).

The logged-in user views and edits **their own** profile (name, email, phone, avatar). Same
multipart pattern as cars ([`../cars/README.md`](../cars/README.md)); this doc covers the
profile-specific bits.

## The data already lives in AuthContext

We don't need a separate "load profile" query — `useAuth()` already holds the current `user`
(fetched on boot via `GET /profile/showProfile`). `ProfilePage` reads `user` to pre-fill the
form (`methods.reset(...)` in a `useEffect` once `user` is available).

## Updating — multipart + refreshing the app

`useUpdateProfile` (in `api.ts`) posts `multipart/form-data` to `POST /profile/updateProfile`
and returns the updated user. Two profile-specific details:

1. **The image field is named `image_url`** here — not `image` like cars. (The backend mixes
   these names; noted in docs/07.) `ImageUploadField name="image_url"` handles it, and we only
   send a new file if the user picked one (`values.image_url instanceof File`).
2. **We refresh the whole app after saving:** on success we call `setUser(updated)` from
   `useAuth()`, so the top-bar name/avatar (and anything else reading `user`) update immediately
   — no reload needed.

On success a green `<Alert>` shows; 422 field errors map back onto the inputs via `setError`,
same as every other form.

The role is shown as a localized `<Chip>` (`t('roles.<role>')`).

## What we verified
Page renders with the user's data pre-filled and the role chip ("المدير العام" for super_admin).
Saving posts `multipart/form-data` → **200** and shows the success alert; `setUser` refreshes the
app. `tsc` + `oxlint` clean; no console errors.

## 🐞 Backend bug found & fixed (second one)
`POST /profile/updateProfile` returned **500**:
> `UserService::updateUserProfile(): Return value must be of type App\Models\User, array returned`

**Root cause:** the method was declared `: User` but its body returns `['user' => $user]`, and
the controller (`UserController@updateProfile`) reads `$result['user']` — so **array is the
intended shape**; only the return-type hint was wrong.

**Fix (one line, in `CarCarePlus/app/Services/Operations/UserService.php`):**
```php
public function updateUserProfile(UserDTO $DTO): array   // was: : User
```
After the fix the endpoint returns 200. **→ Relay to the client** so it's in their source (this is
the second profile-area fix; the first was the missing `auth:sanctum` middleware in M1).

## When you'll touch this
When the backend clarifies the mixed image field names, or if we add password-change / other
account settings here.
