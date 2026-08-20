interface Separators {
  group: string;
  decimal: string;
}

const NBSP = ' ';

const SEPARATORS: Record<string, Separators> = {
  uz: { group: NBSP, decimal: ',' },
  ru: { group: NBSP, decimal: ',' },
  en: { group: ',', decimal: '.' },
};

const DEFAULT_LOCALE = 'uz';

const separatorsFor = (locale: string): Separators => {
  return SEPARATORS[locale] ?? SEPARATORS[DEFAULT_LOCALE];
};

const toNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDecimal = (
  value: string | number | null | undefined,
  { locale = DEFAULT_LOCALE, digits = 0 }: { locale?: string; digits?: number } = {},
): string => {
  const amount = toNumber(value);
  const { group, decimal } = separatorsFor(locale);

  const sign = amount < 0 ? '-' : '';
  const fixed = Math.abs(amount).toFixed(digits);
  const [whole, fraction = ''] = fixed.split('.');

  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const trimmed = fraction.replace(/0+$/, '');

  return sign + grouped + (trimmed ? decimal + trimmed : '');
};

const formatSum = (
  value: string | number | null | undefined,
  currency = 'so\'m',
  locale = DEFAULT_LOCALE,
): string => {
  return `${formatDecimal(value, { locale })} ${currency}`;
};

const formatSumShort = (
  value: string | number | null | undefined,
  locale = DEFAULT_LOCALE,
): string => {
  const amount = toNumber(value);

  if (amount >= 1_000_000_000) {
    return `${formatDecimal(amount / 1_000_000_000, { locale, digits: 1 })} mlrd`;
  }
  if (amount >= 1_000_000) {
    return `${formatDecimal(amount / 1_000_000, { locale, digits: 1 })} mln`;
  }
  if (amount >= 1_000) {
    return `${formatDecimal(amount / 1_000, { locale })} ming`;
  }

  return formatDecimal(amount, { locale });
};

const formatArea = (value: number | null | undefined, locale = DEFAULT_LOCALE): string => {
  return `${formatDecimal(value, { locale, digits: 1 })} m²`;
};

const formatNumber = (value: number | null | undefined, locale = DEFAULT_LOCALE): string => {
  return formatDecimal(value, { locale, digits: 1 });
};

const translated = (value: unknown, locale: string): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  const pick = record[locale] ?? record.uz ?? record.en ?? record.ru;

  return typeof pick === 'string' ? pick : '';
};

const MONTHS: Record<string, string[]> = {
  uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const formatDate = (
  value: string | Date | null | undefined,
  locale = DEFAULT_LOCALE,
): string => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  const months = MONTHS[locale] ?? MONTHS[DEFAULT_LOCALE];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatDateTime = (
  value: string | Date | null | undefined,
  locale = DEFAULT_LOCALE,
): string => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  const pad = (part: number) => String(part).padStart(2, '0');

  return `${formatDate(date, locale)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDelta = (value: number, locale = DEFAULT_LOCALE): string => {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatDecimal(Math.abs(value), { locale })}`;
};

const formatBytes = (value: number | null | undefined, locale = DEFAULT_LOCALE): string => {
  const bytes = Number(value ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  const digits = unit === 0 ? 0 : size < 10 ? 1 : 0;
  return `${formatDecimal(size, { locale, digits })} ${units[unit]}`;
};

export {
  toNumber,
  formatDecimal,
  formatSum,
  formatSumShort,
  formatArea,
  formatNumber,
  translated,
  formatDate,
  formatDateTime,
  formatDelta,
  formatBytes,
};
