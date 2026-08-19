'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Provider as ReduxProvider } from 'react-redux';
import { Toaster } from 'sonner';
import { getQueryClient } from '@/lib/query-client';
import { useSession } from '@/hooks/use-auth';
import { store } from '@/store/store';

/**
 * Barcha provayderlar bitta joyda.
 *
 * Tartib muhim: `ReduxProvider` eng tashqarida, chunki `lib/axios.ts`
 * 401 javobida `store.dispatch(logout())` chaqiradi va bu Query'dan
 * oldin tayyor bo'lishi kerak.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionBootstrap />
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

/**
 * Sahifa yangilanganda Redux bo'shab qoladi, cookie'dagi token esa
 * qoladi. Bu komponent shu holatni sezib `/auth/me` chaqiradi va
 * seansni tiklaydi. Hech narsa chizmaydi.
 */
function SessionBootstrap() {
  useSession();
  return null;
}
