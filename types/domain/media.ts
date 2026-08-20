export type MediaType = 'IMAGE' | 'MODEL' | 'DOCUMENT';

export interface MediaFile {
  id: string;
  type: MediaType;
  url: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploader: { fullName: string; email: string } | null;
}

export interface OrphanFile {
  id: string;
  url: string;
  key: string;
  size: number;
  originalName: string;
}
