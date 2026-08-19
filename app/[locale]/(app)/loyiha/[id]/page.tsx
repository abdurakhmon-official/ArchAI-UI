import { setRequestLocale } from 'next-intl/server';
import { ProjectView } from '@/components/project/project-view';

export default async function ProjectPage(props: PageProps<'/[locale]/loyiha/[id]'>) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <ProjectView id={id} />
    </div>
  );
}
