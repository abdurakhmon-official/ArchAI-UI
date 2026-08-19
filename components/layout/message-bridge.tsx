'use client';

import { useMessages, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { setMessageResolver } from '@/lib/server-messages';

export function MessageBridge() {
  const t = useTranslations('serverMessages');
  const messages = useMessages() as Record<string, Record<string, string> | undefined>;

  useEffect(() => {
    setMessageResolver((code, values) => {
      if (!messages.serverMessages?.[code]) return null;

      /*
        A translation that interpolates a value the server did not send
        makes next-intl throw. Falling back to the English text is worse
        than the translation but far better than a blank toast.
      */
      try {
        return t(code as never, values as never);
      } catch {
        return null;
      }
    });
  }, [t, messages]);

  return null;
}
