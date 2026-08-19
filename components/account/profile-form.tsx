'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSendVerification, useSession } from '@/hooks/use-auth';
import { errorFrom } from '@/lib/errors';
import { queryKeys } from '@/lib/query-client';
import { authService } from '@/lib/services';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { User } from '@/types';

/**
 * Profil.
 *
 * Ikki alohida forma: ma'lumot va parol. Ular bitta so'rovga
 * qo'shilmaydi — parolni o'zgartirish eski parolni talab qiladi va
 * ismni tuzatish uchun uni yozdirish ortiqcha.
 */

export function ProfileForm() {
  const { user } = useSession();

  if (!user) return <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />;

  /*
    The fields are only mounted once the session has resolved.

    They start from `user`, and a `useState` initialiser runs once — so
    with the fields inline the form kept the empty strings it was built
    with before the session arrived. The name field is required, which
    meant the form could never be submitted at all.
  */
  return <Fields key={user.id} user={user} />;
}

function Fields({ user }: { user: User }) {
  const t = useTranslations('account');
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: user.fullName ?? '',
    phone: user.phone ?? '',
    avatar: user.avatar ?? null,
  });

  const save = useMutation({
    mutationFn: async () => {
      const response = await authService.updateProfile({
        fullName: form.fullName,
        phone: form.phone || null,
        avatar: form.avatar,
      });

      return response.data as User;
    },
    onSuccess: (updated) => {
      dispatch(updateUser(updated));
      queryClient.setQueryData(queryKeys.me, updated);
    },
  });

  const detail = save.error ? errorFrom(save.error) : null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
      className="flex max-w-md flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t('email')}</Label>
        {/* Email o'zgartirilmaydi: u hisobning identifikatori. */}
        <Input id="email" value={user.email} disabled className="h-10" />

        {/*
          Tasdiqlanmagan manzil.

          Tasdiqlash hozircha hech narsani cheklamaydi, lekin
          parolni tiklash aynan shu manzilga boradi — ya'ni u
          ishlashiga ishonch hosil qilish foydalanuvchining o'z
          manfaati.
        */}
        {user.email_verified ? null : <VerifyNotice />}
      </div>

      <ImageUpload
        folder="avatar"
        aspect="square"
        label={t('avatar')}
        hint={t('avatarHint')}
        className="max-w-40"
        value={form.avatar}
        onChange={(avatar) => setForm({ ...form, avatar })}
      />

      <Field
        id="fullName"
        label={t('fullName')}
        value={form.fullName}
        error={detail?.fields.fullName}
        required
        onChange={(fullName) => setForm({ ...form, fullName })}
      />

      <Field
        id="phone"
        label={t('phone')}
        value={form.phone}
        error={detail?.fields.phone}
        placeholder="+998 90 123 45 67"
        onChange={(phone) => setForm({ ...form, phone })}
      />

      {detail && Object.keys(detail.fields).length === 0 ? (
        <p className="text-sm text-destructive">{detail.message}</p>
      ) : null}

      <Button type="submit" disabled={save.isPending} className="self-start">
        {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {save.isSuccess && !save.isPending ? t('saved') : t('save')}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------

function Field({
  id,
  label,
  value,
  error,
  placeholder,
  required,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-10"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/**
 * Email tasdiqlanmagani haqida eslatma.
 *
 * Alohida komponent: uning o'z holati bor (xat yuborildimi) va uni
 * formaning holatiga aralashtirish ikkalasini ham chalkashtirardi.
 */
function VerifyNotice() {
  const t = useTranslations('auth.verify');
  const send = useSendVerification();

  if (send.isSuccess) {
    return <p className="text-xs text-muted-foreground">{t('resent')}</p>;
  }

  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
      <AlertTriangle className="size-3.5 shrink-0" />
      {t('pending')}
      <button
        type="button"
        onClick={() => send.mutate()}
        disabled={send.isPending}
        className="underline hover:no-underline disabled:opacity-60"
      >
        {send.isPending ? '…' : t('resend')}
      </button>
    </p>
  );
}
