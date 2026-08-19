'use client';

import { Check, Copy, Link2, Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { errorFrom } from '@/lib/errors';
import { projectService } from '@/lib/services';

/**
 * Loyihani ochiq havola bilan ulashish.
 *
 * Havola KIRISHSIZ ochiladi va faqat ko'rish uchun: qabul qiluvchi
 * odam ko'pincha pudratchi yoki oila a'zosi va uning hisobi yo'q.
 */

export function ShareProject({ projectId, locale }: { projectId: string; locale: string }) {
  const t = useTranslations('project.share');

  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const share = useMutation({
    mutationFn: () => projectService.share(projectId),
    onSuccess: (result) => setToken(result.token),
    onError: (error) => setFailure(errorFrom(error).message),
  });

  const unshare = useMutation({
    mutationFn: () => projectService.unshare(projectId),
    onSuccess: () => {
      setToken(null);
      setCopied(false);
    },
    onError: (error) => setFailure(errorFrom(error).message),
  });

  if (!token) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button variant="outline" size="sm" onClick={() => share.mutate()} disabled={share.isPending}>
          {share.isPending ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
          {t('create')}
        </Button>
        {failure ? <p className="text-xs text-destructive">{failure}</p> : null}
      </div>
    );
  }

  const url = `${window.location.origin}/${locale}/ulashilgan/${token}`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Input readOnly value={url} className="h-8 min-w-0 flex-1 font-mono text-xs sm:w-72" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? t('copied') : t('copy')}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={() => unshare.mutate()}
          disabled={unshare.isPending}
        >
          {unshare.isPending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
          {t('revoke')}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{t('hint')}</p>
      {failure ? <p className="text-xs text-destructive">{failure}</p> : null}
    </div>
  );
}
