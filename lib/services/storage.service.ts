import api from '@/lib/axios';
import type { MediaFile } from '@/types/domain';

/** Folders the API accepts. Kept in step with `UPLOAD_FOLDERS` on the server. */
type UploadFolder = 'furniture' | 'style-preview' | 'skeleton-preview' | 'blog' | 'avatar';

/** 25 MB — mirrors `MAX_UPLOAD_BYTES`. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];

interface UploadOptions {
  /** 0–100. Fires while the request body is being sent. */
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

const upload = async (
  folder: UploadFolder,
  file: File,
  options: UploadOptions = {},
): Promise<MediaFile> => {
  const body = new FormData();
  body.append('file', file);

  const { data } = await api.post<{ data: MediaFile }>(`/s3/${folder}/upload`, body, {
    signal: options.signal,
    onUploadProgress: (event) => {
      if (!options.onProgress || !event.total) return;
      options.onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return data.data;
};

const storageService = { upload };

export { storageService, MAX_UPLOAD_BYTES, IMAGE_MIME_TYPES };
export type { UploadFolder, UploadOptions };
