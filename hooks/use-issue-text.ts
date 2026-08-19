'use client';

import { useMessages, useTranslations } from 'next-intl';
import { useCallback } from 'react';

type Values = Record<string, string | number> | undefined;

/**
 * Renders a validation code in the reader's language.
 *
 * The generator and the form both report codes rather than sentences,
 * so the same result reads correctly in every locale. A code with no
 * translation falls through unchanged — Zod's own defaults arrive that
 * way and are still better than an empty line.
 */
const useIssueText = (group: 'geometry' | 'params') => {
  const t = useTranslations(`issues.${group}`);
  const messages = useMessages() as {
    issues?: Record<string, Record<string, string> | undefined>;
  };

  const known = messages.issues?.[group];

  return useCallback(
    (code: string, values?: Values) => (known?.[code] ? t(code as never, values as never) : code),
    [known, t],
  );
};

export { useIssueText };
