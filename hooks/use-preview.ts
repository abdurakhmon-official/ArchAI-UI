'use client';

import { useQuery } from '@tanstack/react-query';
import { useRoomTypes, usePriceBook, useStyles } from '@/hooks/use-catalog';
import { queryKeys } from '@/lib/query-client';
import { catalogService } from '@/lib/services';

const usePreviewCatalog = (enabled = true) => {
  const skeletons = useQuery({
    queryKey: queryKeys.skeletons,
    queryFn: catalogService.skeletons,
    staleTime: 30 * 60_000,
    enabled,
  });

  const roomTypes = useRoomTypes();
  const styles = useStyles();
  const prices = usePriceBook('standard', enabled);

  const ready = Boolean(
    skeletons.data && styles.data && prices.book && Object.keys(roomTypes.rules).length > 0,
  );

  return {
    ready,
    skeletons: skeletons.data ?? [],
    styles: styles.data ?? [],
    rules: roomTypes.rules,
    names: roomTypes.names,
    book: prices.book,
  };
};

export { usePreviewCatalog };
