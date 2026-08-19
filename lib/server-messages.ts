type Values = Record<string, string | number>;
type Resolver = (code: string, values?: Values) => string | null;

let resolve: Resolver = () => null;

const setMessageResolver = (next: Resolver) => {
  resolve = next;
};

/**
 * Server code to text in the reader's language.
 *
 * `values` carries what the sentence interpolates — a plan code, a
 * count, a limit. The server sends them in `meta` because a translated
 * sentence puts them in a different place than the English one does.
 */
const messageFor = (
  code: string | undefined,
  fallback: string | undefined,
  values?: Values,
): string | null => {
  if (code) {
    const translated = resolve(code, values);
    if (translated) return translated;
  }

  return fallback ?? null;
};

export { setMessageResolver, messageFor };
export type { Resolver, Values };
