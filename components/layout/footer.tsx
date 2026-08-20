import { useTranslations } from 'next-intl';
import { Brand } from '@/components/layout/brand';
import { Link } from '@/i18n/navigation';

type StaticPath = '/constructor' | '/styles' | '/pricing' | '/blog' | '/help' | '/about';

const LINKS: Array<{ href: StaticPath; key: string }> = [
  { href: '/constructor', key: 'constructor' },
  { href: '/styles', key: 'styles' },
  { href: '/pricing', key: 'pricing' },
  { href: '/blog', key: 'blog' },
  { href: '/help', key: 'help' },
  { href: '/about', key: 'about' },
];

export function Footer() {
  const t = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <Brand />
          <p className="max-w-xs text-sm text-muted-foreground">
            Uy loyihasini onlayn yarating — 2D reja, 3D ko&apos;rinish va taxminiy smeta.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <p className="text-xs text-muted-foreground">
            © {year} ArchAI · Smeta taxminiy hisob-kitob, yakuniy narx emas
          </p>
        </div>
      </div>
    </footer>
  );
}
