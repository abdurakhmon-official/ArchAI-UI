'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignIn, useSignUp } from '@/hooks/use-auth';
import { Link, useRouter } from '@/i18n/navigation';
import { errorFrom } from '@/lib/errors';
import { authService } from '@/lib/services';
import { cn } from '@/lib/utils';

/**
 * Kirish va ro'yxatdan o'tish.
 *
 * Bitta komponent, chunki farq faqat maydonlar soni va so'rovda —
 * xatolarni ko'rsatish, yo'naltirish va holat mantig'i bir xil. Ikki
 * faylga bo'linsa, ular jimgina bir-biridan uzoqlashadi.
 */

type Mode = 'signin' | 'signup';

export function AuthForm({ mode }: { mode: Mode }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const search = useSearchParams();

  const signIn = useSignIn();
  const signUp = useSignUp();
  const mutation = mode === 'signin' ? signIn : signUp;

  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [strength, setStrength] = useState<0 | 1 | 2 | 3 | 4 | null>(null);

  const detail = mutation.error ? errorFrom(mutation.error) : null;
  const fieldError = (field: string) => detail?.fields[field];

  /*
    Live strength meter — debounced so we don't fire a request on every
    keystroke. Signup only: signing in doesn't create a password.
  */
  useEffect(() => {
    if (mode !== 'signup' || !form.password) return;

    let cancelled = false;

    const timeout = setTimeout(() => {
      authService
        .passwordStrength({ password: form.password, email: form.email || null, fullName: form.fullName || null })
        .then((response) => {
          if (!cancelled) setStrength(response.data.score);
        })
        .catch(() => {
          if (!cancelled) setStrength(null);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [mode, form.password, form.email, form.fullName]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const done = () => {
      /**
       * `next` — foydalanuvchi kirishga majbur bo'lganda qayerda
       * turgani (`proxy.ts` qo'yadi). U ichki manzil ekanini
       * tekshiramiz: tashqi manzil bo'lsa, ochiq yo'naltirish
       * zaifligi bo'lardi.
       */
      const next = search.get('next');
      if (next && next.startsWith('/') && !next.startsWith('//')) {
        window.location.href = next;
        return;
      }

      router.push('/dashboard');
    };

    if (mode === 'signin') {
      signIn.mutate({ email: form.email, password: form.password }, { onSuccess: done });
      return;
    }

    signUp.mutate(
      {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
      },
      { onSuccess: done },
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {mode === 'signup' && (
        <Field
          id="fullName"
          label={t('fullName')}
          value={form.fullName}
          error={fieldError('fullName')}
          autoComplete="name"
          required
          onChange={(fullName) => setForm({ ...form, fullName })}
        />
      )}

      <Field
        id="email"
        type="email"
        label={t('email')}
        value={form.email}
        error={fieldError('email')}
        autoComplete="email"
        required
        onChange={(email) => setForm({ ...form, email })}
      />

      <Field
        id="password"
        type="password"
        label={t('password')}
        value={form.password}
        error={fieldError('password')}
        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        required
        minLength={mode === 'signup' ? 12 : undefined}
        hint={mode === 'signup' ? t('passwordHint') : undefined}
        onChange={(password) => setForm({ ...form, password })}
      />

      {mode === 'signup' && form.password ? <PasswordStrengthMeter score={strength} /> : null}

      {/*
        Parolni unutdim — faqat kirishda.

        Ro'yxatdan o'tishda bu havola ma'nosiz va faqat chalg'itardi.
      */}
      {mode === 'signin' ? (
        <p className="-mt-1 text-end text-sm">
          <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">
            {t('forgotLink')}
          </Link>
        </p>
      ) : null}

      {mode === 'signup' && (
        <Field
          id="phone"
          type="tel"
          label={t('phone')}
          value={form.phone}
          error={fieldError('phone')}
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          onChange={(phone) => setForm({ ...form, phone })}
        />
      )}

      {/* Maydonga bog'lanmagan xato — masalan "parol noto'g'ri". */}
      {detail && Object.keys(detail.fields).length === 0 ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {detail.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={mutation.isPending} className="mt-2">
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {mode === 'signin' ? t('signInAction') : t('signUpAction')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === 'signin' ? t('noAccount') : t('haveAccount')}{' '}
        <Link
          href={mode === 'signin' ? '/sign-up' : '/sign-in'}
          className="font-medium text-primary hover:underline"
        >
          {mode === 'signin' ? t('signUpAction') : t('signInAction')}
        </Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------

interface FieldProps {
  id: string;
  label: string;
  value: string;
  type?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  onChange: (value: string) => void;
}

function Field({ id, label, value, error, hint, onChange, ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-10"
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={cn('text-xs text-muted-foreground')}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const STRENGTH_STYLES = [
  { label: 'veryWeak', bar: 'bg-destructive' },
  { label: 'weak', bar: 'bg-destructive' },
  { label: 'fair', bar: 'bg-amber-500' },
  { label: 'good', bar: 'bg-lime-500' },
  { label: 'strong', bar: 'bg-emerald-500' },
] as const;

function PasswordStrengthMeter({ score }: { score: 0 | 1 | 2 | 3 | 4 | null }) {
  const t = useTranslations('auth.strength');

  if (score === null) return null;

  const { label, bar } = STRENGTH_STYLES[score];

  return (
    <div className="-mt-2 flex flex-col gap-1">
      <div className="flex gap-1">
        {STRENGTH_STYLES.map((_, index) => (
          <div
            key={index}
            className={cn('h-1 flex-1 rounded-full bg-muted', index <= score && bar)}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t(label)}</p>
    </div>
  );
}
