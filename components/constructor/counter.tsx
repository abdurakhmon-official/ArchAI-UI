'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  hint?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Counter({ label, hint, value, min = 0, max = 9, onChange, className }: Props) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div className={cn('flex items-center justify-between gap-4 py-2', className)}>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
      </div>

      <div
        className="flex shrink-0 items-center gap-1"
        role="group"
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
            event.preventDefault();
            set(value + 1);
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
            event.preventDefault();
            set(value - 1);
          }
        }}
      >
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => set(value - 1)}
          disabled={value <= min}
          aria-label={`${label} — kamaytirish`}
        >
          <Minus className="size-3.5" />
        </Button>

        <output
          className="w-8 text-center font-mono text-sm tabular-nums"
          aria-live="polite"
          aria-label={`${label}: ${value}`}
        >
          {value}
        </output>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => set(value + 1)}
          disabled={value >= max}
          aria-label={`${label} — ko'paytirish`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
