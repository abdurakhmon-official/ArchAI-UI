'use client';

import { useMemo, useRef } from 'react';
import { drawFloor } from '@/lib/geometry';
import type { DrawPrimitive, Extra, Floor } from '@/lib/geometry/types';
import { ratioAt, type Handle } from '@/lib/handles';
import { cn } from '@/lib/utils';

const SCALE = 40;

interface Props {
  floor: Floor;
  names: Record<string, string>;
  extras?: Extra[];
  selectedRoomId?: string | null;
  onSelectRoom?: (roomId: string | null) => void;
  handles?: Handle[];
  onMoveSplit?: (splitId: string, ratio: number) => void;
  onMoveSplitEnd?: () => void;
  showDimensions?: boolean;
  showLabels?: boolean;
  className?: string;
}

export function Plan2D({
  floor,
  names,
  extras,
  selectedRoomId,
  onSelectRoom,
  handles,
  onMoveSplit,
  onMoveSplitEnd,
  showDimensions = true,
  showLabels = true,
  className,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drawing = useMemo(
    () => drawFloor(floor, { names, extras, showDimensions, showLabels }),
    [floor, names, extras, showDimensions, showLabels],
  );

  const { viewBox } = drawing;
  const px = (value: number) => round((value - viewBox.x) * SCALE);
  const py = (value: number) => round((value - viewBox.y) * SCALE);
  const len = (value: number) => round(value * SCALE);

  const interactive = Boolean(onSelectRoom);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${len(viewBox.width)} ${len(viewBox.height)}`}
      className={cn('h-auto w-full select-none text-foreground', className)}
      role="img"
      aria-label={`${floor.level}-qavat rejasi`}
      onClick={interactive ? () => onSelectRoom?.(null) : undefined}
    >
      {drawing.primitives.map((primitive, index) => (
        <Primitive
          key={keyOf(primitive, index)}
          primitive={primitive}
          selected={primitive.kind === 'room' && primitive.roomId === selectedRoomId}
          interactive={interactive}
          onSelect={onSelectRoom}
          px={px}
          py={py}
          len={len}
        />
      ))}

      {}
      {handles && onMoveSplit
        ? handles.map((handle) => (
            <SplitHandle
              key={handle.splitId}
              handle={handle}
              svgRef={svgRef}
              viewBox={viewBox}
              px={px}
              py={py}
              onMove={onMoveSplit}
              onMoveEnd={onMoveSplitEnd}
            />
          ))
        : null}
    </svg>
  );
}

interface HandleProps {
  handle: Handle;
  svgRef: React.RefObject<SVGSVGElement | null>;
  viewBox: { x: number; y: number };
  px: (value: number) => number;
  py: (value: number) => number;
  onMove: (splitId: string, ratio: number) => void;
  onMoveEnd?: () => void;
}

function SplitHandle({ handle, svgRef, viewBox, px, py, onMove, onMoveEnd }: HandleProps) {
  const vertical = handle.axis === 'vertical';

  const toPlan = (event: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const matrix = svg.getScreenCTM();
    if (!matrix) return null;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const local = point.matrixTransform(matrix.inverse());
    return { x: local.x / SCALE + viewBox.x, y: local.y / SCALE + viewBox.y };
  };

  return (
    <g>
      <line
        x1={px(handle.from.x)}
        y1={py(handle.from.y)}
        x2={px(handle.to.x)}
        y2={py(handle.to.y)}
        className="stroke-primary/0 transition-colors hover:stroke-primary/60"
        strokeWidth={3}
      />

      <line
        x1={px(handle.from.x)}
        y1={py(handle.from.y)}
        x2={px(handle.to.x)}
        y2={py(handle.to.y)}
        stroke="transparent"
        strokeWidth={18}
        strokeLinecap="butt"
        style={{ cursor: vertical ? 'ew-resize' : 'ns-resize' }}
        onPointerDown={(event) => {
          // Sudrash ko'rinishni surishga aylanib ketmasin.
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

          event.stopPropagation();
          const plan = toPlan(event);
          if (plan) onMove(handle.splitId, ratioAt(handle, plan));
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          event.currentTarget.releasePointerCapture(event.pointerId);
          onMoveEnd?.();
        }}
        onClick={(event) => event.stopPropagation()}
      />
    </g>
  );
}

interface PrimitiveProps {
  primitive: DrawPrimitive;
  selected: boolean;
  interactive: boolean;
  onSelect?: (roomId: string | null) => void;
  px: (value: number) => number;
  py: (value: number) => number;
  len: (value: number) => number;
}

function Primitive({ primitive, selected, interactive, onSelect, px, py, len }: PrimitiveProps) {
  switch (primitive.kind) {
    case 'room':
      return (
        <polygon
          points={primitive.points.map((point) => `${px(point.x)},${py(point.y)}`).join(' ')}
          className={cn(
            'transition-colors',
            interactive && 'cursor-pointer',
            selected
              ? 'fill-primary/20 stroke-primary'
              : cn(
                  'fill-foreground/4 stroke-transparent',
                  interactive && 'hover:fill-primary/10',
                ),
          )}
          strokeWidth={2}
          onClick={
            interactive
              ? (event) => {
                  event.stopPropagation();
                  onSelect?.(primitive.roomId);
                }
              : undefined
          }
        />
      );

    case 'wall':
      return (
        <line
          x1={px(primitive.from.x)}
          y1={py(primitive.from.y)}
          x2={px(primitive.to.x)}
          y2={py(primitive.to.y)}
          stroke="currentColor"
          strokeWidth={len(primitive.thickness)}
          strokeLinecap="butt"
          opacity={primitive.exterior ? 1 : 0.75}
        />
      );

    case 'window':
      return (
        <>
          <line
            x1={px(primitive.from.x)}
            y1={py(primitive.from.y)}
            x2={px(primitive.to.x)}
            y2={py(primitive.to.y)}
            stroke="currentColor"
            strokeWidth={len(primitive.thickness)}
            opacity={0.18}
          />
          <line
            x1={px(primitive.from.x)}
            y1={py(primitive.from.y)}
            x2={px(primitive.to.x)}
            y2={py(primitive.to.y)}
            stroke="currentColor"
            strokeWidth={Math.max(1, len(0.04))}
          />
        </>
      );

    case 'door-leaf':
      return (
        <line
          x1={px(primitive.from.x)}
          y1={py(primitive.from.y)}
          x2={px(primitive.to.x)}
          y2={py(primitive.to.y)}
          stroke="currentColor"
          strokeWidth={Math.max(1, len(0.05))}
        />
      );

    case 'door-arc': {
      const { hinge, radius, startAngle, sweep } = primitive;
      const sx = hinge.x + Math.cos(startAngle) * radius;
      const sy = hinge.y + Math.sin(startAngle) * radius;
      const ex = hinge.x + Math.cos(startAngle + sweep) * radius;
      const ey = hinge.y + Math.sin(startAngle + sweep) * radius;

      return (
        <path
          d={`M ${px(sx)} ${py(sy)} A ${len(radius)} ${len(radius)} 0 0 ${sweep > 0 ? 1 : 0} ${px(ex)} ${py(ey)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={Math.max(0.5, len(0.02))}
          opacity={0.45}
        />
      );
    }

    case 'label': {
      const size = Math.max(9, len(0.32));

      return (
        <>
          <text
            x={px(primitive.at.x)}
            y={py(primitive.at.y)}
            textAnchor="middle"
            fontSize={size}
            fill="currentColor"
            className="pointer-events-none font-medium"
          >
            {primitive.title}
          </text>
          <text
            x={px(primitive.at.x)}
            y={py(primitive.at.y) + size * 1.15}
            textAnchor="middle"
            fontSize={size * 0.8}
            fill="currentColor"
            opacity={0.6}
            className="pointer-events-none font-mono"
          >
            {primitive.subtitle}
          </text>
        </>
      );
    }

    case 'extra':
      return (
        <>
          <rect
            x={px(primitive.rect.x)}
            y={py(primitive.rect.y)}
            width={len(primitive.rect.width)}
            height={len(primitive.rect.length)}
            fill="currentColor"
            fillOpacity={0.04}
            stroke="currentColor"
            strokeWidth={len(primitive.enclosed ? 0.25 : 0.08)}
            strokeDasharray={primitive.enclosed ? undefined : `${len(0.4)} ${len(0.25)}`}
            opacity={primitive.enclosed ? 0.85 : 0.55}
          />
          <text
            x={px(primitive.rect.x + primitive.rect.width / 2)}
            y={py(primitive.rect.y + primitive.rect.length / 2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.max(8, len(0.26))}
            fill="currentColor"
            opacity={0.65}
            className="pointer-events-none font-mono"
          >
            {primitive.title}
          </text>
        </>
      );

    case 'dimension': {
      const offset = offsetFor(primitive.side, primitive.offset);
      const x1 = px(primitive.from.x + offset.x);
      const y1 = py(primitive.from.y + offset.y);
      const x2 = px(primitive.to.x + offset.x);
      const y2 = py(primitive.to.y + offset.y);
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const vertical = primitive.side === 'left' || primitive.side === 'right';

      return (
        <>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={0.7} opacity={0.5} />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.max(8, len(0.24))}
            fill="currentColor"
            opacity={0.7}
            transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined}
            className="pointer-events-none font-mono"
          >
            {primitive.text}
          </text>
        </>
      );
    }

    case 'stairs': {
      const { at, width, length, steps } = primitive;

      return (
        <g opacity={0.7}>
          <rect
            x={px(at.x)}
            y={py(at.y)}
            width={len(width)}
            height={len(length)}
            fill="none"
            stroke="currentColor"
            strokeWidth={Math.max(1, len(0.04))}
          />
          {Array.from({ length: steps - 1 }, (_, index) => {
            const y = py(at.y + (length / steps) * (index + 1));
            return (
              <line
                key={index}
                x1={px(at.x)}
                y1={y}
                x2={px(at.x + width)}
                y2={y}
                stroke="currentColor"
                strokeWidth={Math.max(0.5, len(0.02))}
                opacity={0.6}
              />
            );
          })}
        </g>
      );
    }

    case 'gap':
    default:
      return null;
  }
}

function offsetFor(side: 'top' | 'bottom' | 'left' | 'right', offset: number) {
  if (side === 'top') return { x: 0, y: -offset };
  if (side === 'bottom') return { x: 0, y: offset };
  if (side === 'left') return { x: -offset, y: 0 };
  return { x: offset, y: 0 };
}

function keyOf(primitive: DrawPrimitive, index: number): string {
  if ('roomId' in primitive) return `${primitive.kind}-${primitive.roomId}`;
  if ('openingId' in primitive) return `${primitive.kind}-${primitive.openingId}`;
  if ('extraId' in primitive) return `${primitive.kind}-${primitive.extraId}`;
  if ('wallId' in primitive) return `${primitive.kind}-${primitive.wallId}-${index}`;

  return `${primitive.kind}-${index}`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
