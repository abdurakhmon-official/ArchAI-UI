'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useHydrated } from '@/hooks/use-hydrated';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  // Server joriy mavzuni bilmaydi — birinchi renderda bo'sh joy qoldiramiz,
  // aks holda gidratatsiya nomuvofiqligi chiqadi.
  if (!hydrated) return <div className="size-9" aria-hidden />;

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Yorug‘ mavzu' : 'Qorong‘i mavzu'}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
