import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { GenerationProgress } from '@/components/results/generation-progress';
import { ResultsView } from '@/components/results/results-view';

/**
 * Natijalar sahifasi.
 *
 * `ResultsView` `useSearchParams` ishlatadi, ya'ni u faqat brauzerda
 * chiziladi — shuning uchun `Suspense` bilan o'raladi.
 */

export async function generateMetadata(
  props: PageProps<'/[locale]/constructor/results'>,
) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'results' });

  return { title: t('title') };
}

export default async function ResultsPage(props: PageProps<'/[locale]/constructor/results'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Suspense fallback={<GenerationProgress />}>
        <ResultsView />
      </Suspense>
    </div>
  );
}
