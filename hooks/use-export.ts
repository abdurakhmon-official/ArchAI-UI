'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { queryKeys } from '@/lib/query-client';
import { jobService, projectService } from '@/lib/services';

const POLL_MS = 1500;
const MAX_POLLS = 60;

export function useProjectPdf(projectId: string) {
  const locale = useLocale();
  const [jobId, setJobId] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [polls, setPolls] = useState(0);

  const request = useMutation({
    mutationFn: () => projectService.requestPdf(projectId, locale),
    onSuccess: (result) => {
      setPolls(0);

      if (result.ready && result.url) {
        setUrl(result.url);
        return;
      }

      setJobId(result.jobId ?? null);
    },
  });

  const job = useQuery({
    queryKey: queryKeys.job(jobId ?? ''),
    queryFn: async () => {
      const status = await jobService.status(jobId!);
      setPolls((count) => count + 1);

      if (status.state === 'completed' && status.url) {
        setUrl(status.url);
        setJobId(null);
      }

      if (status.state === 'failed') setJobId(null);

      return status;
    },
    enabled: Boolean(jobId) && polls < MAX_POLLS,
    refetchInterval: POLL_MS,
    staleTime: 0,
    retry: false,
  });

  const timedOut = Boolean(jobId) && polls >= MAX_POLLS;

  return {
    url,
    request: () => {
      setUrl(null);
      request.mutate();
    },
    pending: request.isPending || (Boolean(jobId) && !timedOut),
    error: request.error ?? (job.data?.state === 'failed' ? new Error(job.data.error ?? '') : null),
    timedOut,
  };
}

export function useProjectRender(projectId: string) {
  const [view, setView] = useState<RenderView>('exterior');
  const [jobId, setJobId] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [polls, setPolls] = useState(0);

  const request = useMutation({
    mutationFn: (next: RenderView) => projectService.requestRender(projectId, next),
    onSuccess: (result) => {
      setPolls(0);

      if (result.ready && result.url) {
        setUrl(result.url);
        return;
      }

      setJobId(result.jobId ?? null);
    },
  });

  const job = useQuery({
    queryKey: queryKeys.job(jobId ?? ''),
    queryFn: async () => {
      const status = await jobService.status(jobId!);
      setPolls((count) => count + 1);

      if (status.state === 'completed' && status.url) {
        setUrl(status.url);
        setJobId(null);
      }

      if (status.state === 'failed') setJobId(null);

      return status;
    },
    enabled: Boolean(jobId) && polls < MAX_POLLS,
    refetchInterval: POLL_MS,
    staleTime: 0,
    retry: false,
  });

  const timedOut = Boolean(jobId) && polls >= MAX_POLLS;

  return {
    url,
    view,
    request: (next: RenderView) => {
      setView(next);
      setUrl(null);
      request.mutate(next);
    },
    pending: request.isPending || (Boolean(jobId) && !timedOut),
    error: request.error ?? (job.data?.state === 'failed' ? new Error(job.data.error ?? '') : null),
    timedOut,
  };
}

export type RenderView = 'exterior' | 'cutaway' | 'interior';
