import { useMutation } from '@tanstack/react-query';
import { http, unwrap } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse, AuthUser } from '../../api/types';

// Update the current user's own profile. multipart/form-data because it can carry a new
// avatar. NOTE the image field is named `image_url` here (cars use `image`) — see docs/07.
export interface ProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  image_url?: File | null;
}

function toFormData(input: ProfileInput): FormData {
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (value instanceof File) fd.append(key, value);
    else fd.append(key, String(value));
  });
  return fd;
}

// POST /profile/updateProfile -> updated user object.
export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: ProfileInput) =>
      unwrap<AuthUser>(http.post<ApiResponse<AuthUser>>(endpoints.profile.update, toFormData(input))),
  });
}
