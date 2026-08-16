import axios, { AxiosError } from 'axios';
import i18n from '../i18n';
import type { ApiResponse } from './types';
import { ApiError } from './types';

const TOKEN_KEY = 'ccp_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: 'application/json' },
});

// Attach bearer token + the active UI language on every request. The backend's SetLocale
// middleware reads Accept-Language and localizes messages + enum labels (see docs/13 §1).
http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = i18n.language || 'ar';
  return config;
});

// Normalize errors: 401 -> logout, 422 -> field errors, envelope status 0 -> throw.
http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    // The envelope can report failure even on HTTP 200.
    if (body && typeof body === 'object' && 'status' in body && body.status === 0) {
      throw new ApiError(body.message, body.status_code, undefined, body.data);
    }
    return response;
  },
  (error: AxiosError<ApiResponse<unknown> & { errors?: Record<string, string[]> }>) => {
    const res = error.response;
    const status = res?.status ?? 0;

    if (status === 401) {
      tokenStore.clear();
      // Let the app react (redirect handled by the auth guard / a listener).
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    const body = res?.data;
    // Laravel 422 puts field errors under `errors` (or inside `data`). Grab either.
    const fieldErrors =
      (body?.errors as Record<string, string[]> | undefined) ??
      (body?.data as Record<string, string[]> | undefined);

    throw new ApiError(
      body?.message || error.message || 'Network error',
      body?.status_code || status,
      status === 422 ? fieldErrors : undefined,
      body?.data,
    );
  },
);

// Unwrap the envelope and return just `data`. Use in every API call.
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  return res.data.data as T;
}

// A handful of `index` endpoints started paginating server-side (default 15/page, see
// docs/11 §1) without us building real pagination UI yet. Passed as axios `params` on
// those GET calls so a `DataTable` that expects the full list keeps seeing it — a stopgap
// until we build server-side pagination into DataTable, at which point this goes away.
export const ALL_ROWS_PARAMS = { per_page: 200 };
