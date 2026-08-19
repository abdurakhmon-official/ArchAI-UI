import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,

    formats: {
      number: {
        sum: { style: 'decimal', maximumFractionDigits: 0 },
        area: { style: 'decimal', maximumFractionDigits: 1 },
      },
      dateTime: {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
      },
    },
  };
});
