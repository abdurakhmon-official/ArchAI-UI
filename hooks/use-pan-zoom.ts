'use client';

import { useCallback, useRef, useState } from 'react';

const MIN_SCALE = 0.5;
const MAX_SCALE = 6;
const WHEEL_SENSITIVITY = 0.0015;

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const distanceBetween = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};

const halfWidth = (ref: React.RefObject<HTMLDivElement | null>): number => {
  return (ref.current?.clientWidth ?? 0) / 2;
};

const halfHeight = (ref: React.RefObject<HTMLDivElement | null>): number => {
  return (ref.current?.clientHeight ?? 0) / 2;
};

const usePanZoom = () => {
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  const containerRef = useRef<HTMLDivElement>(null);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const moved = useRef(false);
  const captured = useRef(new Set<number>());

  const zoomAt = useCallback((factor: number, originX: number, originY: number) => {
    setTransform((current) => {
      const next = clamp(current.scale * factor, MIN_SCALE, MAX_SCALE);
      if (next === current.scale) return current;

      const ratio = next / current.scale;
      return {
        scale: next,
        x: originX - (originX - current.x) * ratio,
        y: originY - (originY - current.y) * ratio,
      };
    });
  }, []);

  const onWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const box = containerRef.current?.getBoundingClientRect();
      if (!box) return;

      zoomAt(
        Math.exp(-event.deltaY * WHEEL_SENSITIVITY),
        event.clientX - box.left,
        event.clientY - box.top,
      );
    },
    [zoomAt],
  );

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    moved.current = false;

    if (pointers.current.size === 2) {
      const [first, second] = [...pointers.current.values()];
      pinchStart.current = { distance: distanceBetween(first, second), scale: 0 };
    }

  }, []);

  const capture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (captured.current.has(event.pointerId)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    captured.current.add(event.pointerId);
  };

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;

    const current = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, current);

    if (pointers.current.size >= 2) {
      const [first, second] = [...pointers.current.values()];
      const distance = distanceBetween(first, second);
      const start = pinchStart.current;

      if (start && start.distance > 0) {
        moved.current = true;
        capture(event);
        const box = event.currentTarget.getBoundingClientRect();
        setTransform((state) => {
          const next = clamp(state.scale * (distance / start.distance), MIN_SCALE, MAX_SCALE);
          const ratio = next / state.scale;
          const originX = (first.x + second.x) / 2 - box.left;
          const originY = (first.y + second.y) / 2 - box.top;

          return {
            scale: next,
            x: originX - (originX - state.x) * ratio,
            y: originY - (originY - state.y) * ratio,
          };
        });
        pinchStart.current = { distance, scale: 0 };
      }
      return;
    }

    const dx = current.x - previous.x;
    const dy = current.y - previous.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      moved.current = true;
      capture(event);
    }

    if (!moved.current) return;

    setTransform((state) => ({ ...state, x: state.x + dx, y: state.y + dy }));
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    captured.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  }, []);

  const zoomIn = useCallback(() => zoomAt(1.25, halfWidth(containerRef), halfHeight(containerRef)), [zoomAt]);
  const zoomOut = useCallback(() => zoomAt(0.8, halfWidth(containerRef), halfHeight(containerRef)), [zoomAt]);
  const reset = useCallback(() => setTransform(IDENTITY), []);

  return {
    containerRef,
    transform,
    isPanned: transform.scale !== 1 || transform.x !== 0 || transform.y !== 0,
    didPan: () => moved.current,
    zoomIn,
    zoomOut,
    reset,
    handlers: {
      onWheel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
};

export { usePanZoom };
