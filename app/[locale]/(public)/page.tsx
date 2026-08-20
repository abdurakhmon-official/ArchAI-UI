import { Boxes, Gauge, PencilRuler, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button-link';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(props: PageProps<'/[locale]'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'home' });

  /*
    Bosh sahifada `title` layoutdagi sukut sarlavhasi bilan
    ALMASHTIRILMAYDI: `pageMetadata` uni qaytaradi va Next uni
    `%s · ArchAI` andozasiga soladi. Shuning uchun bu yerda brend nomi
    takrorlanmaydi.
  */
  return pageMetadata({
    locale,
    href: '/',
    title: t('title'),
    description: t('subtitle'),
  });
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Home />;
}

function Home() {
  const t = useTranslations('home');

  const features = [
    { key: 'fast', Icon: Zap },
    { key: 'accurate', Icon: Gauge },
    { key: 'variants', Icon: Boxes },
    { key: 'editable', Icon: PencilRuler },
  ] as const;

  const steps = ['one', 'two', 'three', 'four'] as const;

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-linear-to-b from-primary/4 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-4 inline-flex rounded-full border bg-background px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            {t('eyebrow')}
          </p>

          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {t('title')}
          </h1>

          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t('subtitle')}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink size="lg" href="/constructor">
              {t('cta')}
            </ButtonLink>
            <ButtonLink size="lg" variant="outline" href="/styles">
              {t('howItWorks')}
            </ButtonLink>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {features.map(({ key, Icon }) => (
              <div key={key} className="flex flex-col gap-2">
                <Icon className="size-5 text-primary" />
                <dt className="text-sm font-semibold">{t(`features.${key}.title`)}</dt>
                <dd className="text-sm text-muted-foreground">{t(`features.${key}.text`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Qanday ishlaydi */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('howItWorks')}</h2>

        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step} className="rounded-lg border bg-card p-5">
              <span className="font-mono text-xs font-bold text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-semibold">{t(`steps.${step}.title`)}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(`steps.${step}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
