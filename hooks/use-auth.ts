'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookie from 'js-cookie';
import { useCallback, useEffect } from 'react';
import { TOKEN_COOKIE } from '@/lib/axios';
import { queryKeys } from '@/lib/query-client';
import { authService } from '@/lib/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, setCredentials } from '@/store/slices/authSlice';
import type { AccessToken, User } from '@/types';
import type { ForgotPasswordInput } from '@/types/input/ForgotPasswordInput';
import type { ResetPasswordInput } from '@/types/input/ResetPasswordInput';
import type { SigninInput } from '@/types/input/SigninInput';
import type { SignupInput } from '@/types/input/SignupInput';

const unwrap = <T,>(envelope: { data: T }): T => {
  return envelope.data;
};

const storeToken = (token: AccessToken): void => {
  Cookie.set(TOKEN_COOKIE, token.accessToken, {
    expires: token.expiresIn / 86_400,
    sameSite: 'lax',
    secure: window.location.protocol === 'https:',
  });
};

const useSession = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const hasToken = typeof window !== 'undefined' && Boolean(Cookie.get(TOKEN_COOKIE));

  const query = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => unwrap<User>(await authService.me()),
    enabled: hasToken && !user,
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const fetched = query.data;
    if (fetched && !user) {
      dispatch(setCredentials({ user: fetched, token: Cookie.get(TOKEN_COOKIE) ?? '' }));
    }
  }, [query.data, user, dispatch]);

  return {
    user,
    loading: hasToken && !user && query.isPending,
    isAuthenticated: Boolean(user),
  };
};

const useSignIn = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SigninInput) => {
      const token = unwrap<AccessToken>(await authService.signIn(input));
      storeToken(token);

      const user = unwrap<User>(await authService.me());
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      dispatch(setCredentials({ user, token: token.accessToken }));
      queryClient.setQueryData(queryKeys.me, user);
    },
  });
};

const useSignUp = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const token = unwrap<AccessToken>(await authService.signUp(input));
      storeToken(token);

      const user = unwrap<User>(await authService.me());
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      dispatch(setCredentials({ user, token: token.accessToken }));
      queryClient.setQueryData(queryKeys.me, user);
    },
  });
};

const useSignOut = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useCallback(() => {
    Cookie.remove(TOKEN_COOKIE);
    dispatch(logout());
    queryClient.clear();
  }, [dispatch, queryClient]);
};

const useForgotPassword = () => {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authService.forgotPassword(input),
  });
};

const useResetPassword = () => {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authService.resetPassword(input),
  });
};

const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
};

const useSendVerification = () => {
  return useMutation({
    mutationFn: () => authService.sendVerification(),
  });
};

export {
  useSession,
  useSignIn,
  useSignUp,
  useSignOut,
  useForgotPassword,
  useResetPassword,
  useVerifyEmail,
  useSendVerification,
};
