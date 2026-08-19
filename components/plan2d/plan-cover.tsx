'use client';

import { cn } from '@/lib/utils';

interface Props {
  svg: string;
  className?: string;
}

export function PlanCover({ svg, className }: Props) {
  return (
    <div
      className={cn(
        'flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg bg-muted/40 p-3',
        '[&>svg]:h-full [&>svg]:w-full [&>svg]:text-foreground',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
