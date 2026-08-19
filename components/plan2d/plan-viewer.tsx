'use client';

import { Maximize2, Minus, Plus, Ruler, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Plan2D } from '@/components/plan2d/plan-2d';
import { RoomInfo } from '@/components/plan2d/room-info';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePanZoom } from '@/hooks/use-pan-zoom';
import type { House } from '@/lib/geometry/types';
import { splitHandles } from '@/lib/handles';
import { cn } from '@/lib/utils';

interface Props {
  house: House;
  names: Record<string, string>;
  selectedRoomId?: string | null;
  onSelectRoom?: (roomId: string | null) => void;
  roomActions?: React.ReactNode;
  onMoveSplit?: (level: number, splitId: string, ratio: number) => void;
  onMoveSplitEnd?: () => void;
  className?: string;
}

export function PlanViewer({
  house,
  names,
  selectedRoomId: controlledId,
  onSelectRoom,
  roomActions,
  onMoveSplit,
  onMoveSplitEnd,
  className,
}: Props) {
  const t = useTranslations('plan');

  const [level, setLevel] = useState(house.floors[0]?.level ?? 1);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const [ownId, setOwnId] = useState<string | null>(null);
  const selectedRoomId = controlledId !== undefined ? controlledId : ownId;

  const { containerRef, handlers, transform, isPanned, didPan, zoomIn, zoomOut, reset } =
    usePanZoom();

  const floor = useMemo(
    () => house.floors.find((item) => item.level === level) ?? house.floors[0],
    [house.floors, level],
  );

  const handles = useMemo(
    () => (onMoveSplit && floor ? splitHandles(floor.tree, house.bounds) : undefined),
    [onMoveSplit, floor, house.bounds],
  );

  const selectedRoom = useMemo(
    () => floor?.rooms.find((room) => room.id === selectedRoomId) ?? null,
    [floor, selectedRoomId],
  );

  const select = (roomId: string | null) => {
    if (didPan()) return;

    if (controlledId === undefined) setOwnId(roomId);
    onSelectRoom?.(roomId);
  };

  if (!floor) return null;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {house.floors.length > 1 ? (
          <div
            role="group"
            aria-label={t('floors')}
            className="inline-flex rounded-lg bg-muted p-[3px]"
          >
            {house.floors.map((item) => (
              <button
                key={item.level}
                type="button"
                onClick={() => {
                  setLevel(item.level);
                  select(null);
                }}
                aria-pressed={item.level === level}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  item.level === level
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t('floor', { level: item.level })}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{t('floor', { level: floor.level })}</span>
        )}

        <div className="flex items-center gap-1">
          <Toggle
            active={showLabels}
            label={t('toggleLabels')}
            onClick={() => setShowLabels((value) => !value)}
          >
            <Tag className="size-4" />
          </Toggle>

          <Toggle
            active={showDimensions}
            label={t('toggleDimensions')}
            onClick={() => setShowDimensions((value) => !value)}
          >
            <Ruler className="size-4" />
          </Toggle>

          <span className="mx-1 h-5 w-px bg-border" aria-hidden />

          <Toggle active={false} label={t('zoomOut')} onClick={zoomOut}>
            <Minus className="size-4" />
          </Toggle>

          <Toggle active={false} label={t('zoomIn')} onClick={zoomIn}>
            <Plus className="size-4" />
          </Toggle>

          <Toggle
            active={false}
            label={t('resetView')}
            onClick={reset}
            disabled={!isPanned}
          >
            <Maximize2 className="size-4" />
          </Toggle>
        </div>
      </div>

      <div
        ref={containerRef}
        {...handlers}
        className="relative touch-none overflow-hidden rounded-xl border bg-card p-4"
        style={{ cursor: isPanned ? 'grab' : undefined }}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
          }}
        >
          <Plan2D
            floor={floor}
            names={names}
            extras={house.extras}
            selectedRoomId={selectedRoomId}
            onSelectRoom={select}
            handles={handles}
            onMoveSplitEnd={onMoveSplitEnd}
            onMoveSplit={
              onMoveSplit ? (splitId, ratio) => onMoveSplit(floor.level, splitId, ratio) : undefined
            }
            showDimensions={showDimensions}
            showLabels={showLabels}
          />
        </div>
      </div>

      {selectedRoom ? (
        <RoomInfo room={selectedRoom} name={names[selectedRoom.roomType] ?? selectedRoom.roomType}>
          {roomActions}
        </RoomInfo>
      ) : (
        <p className="text-center text-sm text-muted-foreground">{t('selectHint')}</p>
      )}
    </div>
  );
}

interface ToggleProps {
  active: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function Toggle({ active, label, disabled, onClick, children }: ToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={active ? 'secondary' : 'ghost'}
            size="icon"
            className="size-8"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
