'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

const useHydrated = (): boolean => {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
};

export { useHydrated };
