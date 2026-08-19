'use client';

import { Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const STEPS = ['skeleton', 'rooms', 'circulation', 'openings', 'estimate'] as const;
const STEP_MS = 700;

export function GenerationProgress() {
  const t = useTranslations('constructor.generating');
  const [reached, setReached] = useState(0);

  useEffect(() => {
    if (reached >= STEPS.length - 1) return;

    const timer = setTimeout(() => setReached((value) => value + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [reached]);

  return (
    <div className="flex flex-col items-center gap-8 py-20" aria-busy="true">
      <div className="text-center">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
      </div>

      <ol className="flex w-full max-w-sm flex-col gap-3">
        {STEPS.map((step, index) => {
          const done = index < reached;
          const active = index === reached;

          return (
            <li
              key={step}
              className={cn(
                'flex items-center gap-3 text-sm transition-opacity',
                !done && !active && 'opacity-40',
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active && 'border-primary text-primary',
                )}
              >
                {done ? (
                  <Check className="size-3.5" />
                ) : active ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>

              <span className={cn(done && 'text-muted-foreground', active && 'font-medium')}>
                {t(step)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
