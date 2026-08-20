'use client';

import { Loader2, LogIn, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/hooks/use-auth';
import { useCreateProject } from '@/hooks/use-projects';
import { usePathname, useRouter } from '@/i18n/navigation';
import { errorFrom } from '@/lib/errors';
import type { GenerateParams, GeometryState } from '@/types/domain';


interface Props {
  params: GenerateParams;
  geometry: GeometryState;
  defaultTitle: string;
  styleSlug?: string | null;
  skeletonId?: string | null;
}

export function SaveProject({ params, geometry, defaultTitle, styleSlug, skeletonId }: Props) {
  const t = useTranslations('project');
  const { isAuthenticated } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const search = useSearchParams();

  const [open, setOpen] = useState(search.get('saqlash') === '1');
  const [title, setTitle] = useState(defaultTitle);
  const create = useCreateProject();

  if (!isAuthenticated) {
    const here = `${pathname}?${new URLSearchParams({
      ...Object.fromEntries(search.entries()),
      saqlash: '1',
    })}`;

    return (
      <ButtonLink variant="outline" size="sm" href={{ pathname: '/sign-in', query: { next: here } }}>
        <LogIn className="size-4" />
        {t('signInToSave')}
      </ButtonLink>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Save className="size-4" />
        {t('save')}
      </Button>
    );
  }

  const detail = create.error ? errorFrom(create.error) : null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    create.mutate(
      {
        title: title.trim() || defaultTitle,
        params,
        geometry,
        styleSlug: styleSlug ?? null,
        skeletonId: skeletonId ?? null,
        finishLevel: params.finishLevel,
      },
      { onSuccess: (project) => router.push({ pathname: '/project/[id]', params: { id: project.id } }) },
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor="project-title" className="text-xs">
          {t('titleLabel')}
        </Label>
        <Input
          id="project-title"
          value={title}
          maxLength={120}
          autoFocus
          onChange={(event) => setTitle(event.target.value)}
          className="h-8 w-56"
        />
      </div>

      <Button type="submit" size="sm" disabled={create.isPending}>
        {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {t('save')}
      </Button>

      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        {t('cancel')}
      </Button>

      {}
      {detail ? (
        <p className="w-full text-xs text-destructive">
          {detail.code === 'PLAN_LIMIT'
            ? t('planLimit', { limit: detail.meta?.limit ?? 0 })
            : detail.message}
        </p>
      ) : null}
    </form>
  );
}
