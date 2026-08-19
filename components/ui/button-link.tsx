import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type Props = ComponentProps<typeof Link> &
  Pick<ComponentProps<typeof Button>, 'variant' | 'size'>;

export function ButtonLink({ variant, size, ...props }: Props) {
  return <Button variant={variant} size={size} nativeButton={false} render={<Link {...props} />} />;
}
