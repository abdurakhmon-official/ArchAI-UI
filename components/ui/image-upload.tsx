'use client';

import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useRef, useState } from 'react';
import { errorFrom } from '@/lib/errors';
import { formatBytes } from '@/lib/formatters';
import { IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES, storageService } from '@/lib/services';
import type { UploadFolder } from '@/lib/services';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  folder: UploadFolder;
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  /** Preview box aspect ratio. */
  aspect?: 'video' | 'square';
}

const ImageUpload = ({
  folder,
  value,
  onChange,
  label,
  hint,
  disabled,
  className,
  aspect = 'video',
}: ImageUploadProps) => {
  const t = useTranslations('upload');
  const locale = useLocale();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failure, setFailure] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const send = async (file: File) => {
    setFailure(null);

    if (!IMAGE_MIME_TYPES.includes(file.type)) {
      setFailure(t('wrongType'));
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setFailure(t('tooLarge', { limit: formatBytes(MAX_UPLOAD_BYTES, locale) }));
      return;
    }

    setBusy(true);
    setProgress(0);

    try {
      const media = await storageService.upload(folder, file, { onProgress: setProgress });
      onChange(media.url);
    } catch (error) {
      setFailure(errorFrom(error).message);
    } finally {
      setBusy(false);
      /*
        The same file can fail and then be retried. A file input keeps its
        value, so without this the second pick fires no change event.
      */
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const drop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);

    if (disabled || busy) return;

    const file = event.dataTransfer.files?.[0];
    if (file) void send(file);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_MIME_TYPES.join(',')}
        className="sr-only"
        disabled={disabled || busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void send(file);
        }}
      />

      {value ? (
        <div
          className={cn(
            'group relative overflow-hidden rounded-xl border bg-muted/30',
            aspect === 'square' ? 'aspect-square' : 'aspect-video',
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label ?? t('preview')} className="size-full object-cover" />

          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || busy}
              className="rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-50"
            >
              {busy ? `${progress}%` : t('replace')}
            </button>
            <button
              type="button"
              aria-label={t('remove')}
              onClick={() => onChange(null)}
              disabled={disabled || busy}
              className="rounded-lg bg-white/90 p-1.5 text-neutral-900 transition-colors hover:bg-white hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={drop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
            aspect === 'square' ? 'aspect-square' : 'aspect-video',
            dragging ? 'border-primary bg-primary/5' : 'hover:border-foreground/30 hover:bg-muted/40',
            (disabled || busy) && 'pointer-events-none opacity-60',
          )}
        >
          {busy ? (
            <>
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="text-sm tabular-nums text-muted-foreground">{progress}%</span>
              <span className="h-1 w-32 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full bg-primary transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </span>
            </>
          ) : (
            <>
              {dragging ? (
                <Upload className="size-6 text-primary" />
              ) : (
                <ImagePlus className="size-6 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{t('pick')}</span>
              <span className="text-xs text-muted-foreground">
                {hint ?? t('limit', { limit: formatBytes(MAX_UPLOAD_BYTES, locale) })}
              </span>
            </>
          )}
        </button>
      )}

      {failure ? <p className="text-sm text-destructive">{failure}</p> : null}
    </div>
  );
};

export { ImageUpload };
export type { ImageUploadProps };
