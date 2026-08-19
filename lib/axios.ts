import axios, { isAxiosError } from 'axios';
import Cookie from 'js-cookie';
import { toast } from 'sonner';
import { store } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { routing } from '@/i18n/routing';
import { messageFor } from '@/lib/server-messages';
import type { ApiError } from '@/types/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const TOKEN_COOKIE = 'token';

api.interceptors.request.use((config) => {
  const token = Cookie.get(TOKEN_COOKIE);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => {
    const message = messageFor(response.data?._code, response.data?._message, response.data?.meta);
    if (message) toast.success(message);

    return response;
  },
  (error: unknown) => {
    if (!isAxiosError<ApiError>(error)) return Promise.reject(error);

    const status = error.response?.status;
    const body = error.response?.data;

    if (status === 401) {
      Cookie.remove(TOKEN_COOKIE);
      store.dispatch(logout());
      toast.error(messageFor('SESSION_EXPIRED', 'session expired, please sign in again') ?? '');
      redirectToSignIn();

      return Promise.reject(error);
    }

    const handledInPlace =
      body?.code === 'PLAN_LIMIT' || (body?.errors?.length ?? 0) > 0 || status === 404;

    if (!handledInPlace) {
      toast.error(
        messageFor(body?._code, body?._message, body?.meta as Record<string, string | number>) ??
          error.message,
      );
    }

    return Promise.reject(error);
  },
);

function redirectToSignIn(): void {
  if (typeof window === 'undefined') return;

  const [, first] = window.location.pathname.split('/');
  const locale = routing.locales.includes(first as never) ? first : routing.defaultLocale;

  const entry = routing.pathnames['/kirish'];
  const path = typeof entry === 'string' ? entry : (entry as Record<string, string>)[locale];

  const target = `/${locale}${path}`;
  if (window.location.pathname === target) return;

  const next = window.location.pathname + window.location.search;

  window.location.href = `${target}?next=${encodeURIComponent(next)}`;
}

export default api;
