import { isAxiosError } from 'axios';
import { messageFor } from '@/lib/server-messages';
import type { ApiError } from '@/types/api';

export interface ErrorDetail {
  message: string;
  code?: ApiError['code'];
  meta?: ApiError['meta'];
  fields: Record<string, string>;
  status?: number;
}

export function errorFrom(error: unknown): ErrorDetail {
  if (isAxiosError<ApiError>(error)) {
    const body = error.response?.data;

    return {
      /*
        `_code` wins over `_message`: the server writes English, the
        reader may not read it. `meta` carries what the sentence
        interpolates.
      */
      message:
        messageFor(body?._code, body?._message, body?.meta as Record<string, string | number>) ??
        error.message,
      code: body?.code,
      meta: body?.meta,
      /*
        Field errors carry a code too — Zod is given the code as its
        message. Anything that is not a known code passes through, so
        library defaults still read sensibly.
      */
      fields: Object.fromEntries(
        (body?.errors ?? []).map((item) => [
          item.field,
          messageFor(item.message, item.message) ?? item.message,
        ]),
      ),
      status: error.response?.status,
    };
  }

  return { message: error instanceof Error ? error.message : String(error), fields: {} };
}

export function isPlanLimit(error: unknown): boolean {
  return errorFrom(error).code === 'PLAN_LIMIT';
}
