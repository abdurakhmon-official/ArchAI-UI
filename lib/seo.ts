import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

type Route = Parameters<typeof getPathname>[0]['href'];

export interface PageSeo {
  locale: string;
  href: Route;
  title: string;
  description?: string;
}

const localeUrls = (href: Route): Record<string, string> => {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, SITE_URL + getPathname({ href, locale })]),
  );
};

const pageMetadata = ({ locale, href, title, description }: PageSeo): Metadata => {
  const urls = localeUrls(href);

  return {
    title,
    ...(description ? { description } : {}),
    alternates: {
      canonical: urls[locale],
      languages: {
        ...urls,
        'x-default': urls[routing.defaultLocale],
      },
    },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url: urls[locale],
      siteName: 'ArchAI',
      locale,
      type: 'website',
    },
  };
};

export { localeUrls, pageMetadata };
