'use client';

import { AlertTriangle, Plus, Redo2, Undo2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { RoomActions } from '@/components/editor/room-actions';
import { PlanViewer } from '@/components/plan2d/plan-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEditor } from '@/hooks/use-editor';
import type { RoomTypeRule } from '@/lib/geometry/types';
import { formatArea } from '@/lib/formatters';
import { useIssueText } from '@/hooks/use-issue-text';
import { cn } from '@/lib/utils';
import type { GeometryState, Style } from '@/types/domain';

interface Props {
  geometry: GeometryState;
  rules: Record<string, RoomTypeRule>;
  names: Record<string, string>;
  style?: Style | null;
  onChange?: (geometry: GeometryState) => void;
  className?: string;
}

export function Editor({ geometry, rules, names, style, onChange, className }: Props) {
  const issueText = useIssueText('geometry');
  const t = useTranslations('editor');
  const editor = useEditor(geometry, { rules, style });
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    onChange?.(editor.geometry);
  }, [editor.geometry, onChange]);

  const roomTypes = Object.values(rules)
    .map((rule) => ({ code: rule.code, name: names[rule.code] ?? rule.code }))
    .sort((first, second) => first.name.localeCompare(second.name));

  const selectedRoom =
    editor.house?.floors
      .flatMap((floor) => floor.rooms.map((room) => ({ room, level: floor.level })))
      .find((entry) => entry.room.id === selectedRoomId) ?? null;

  const activeRoomId = selectedRoom ? selectedRoomId : null;

  if (!editor.house) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  const errors = editor.validation?.issues.filter((issue) => issue.severity === 'error') ?? [];
  const warnings = editor.validation?.issues.filter((issue) => issue.severity === 'warning') ?? [];

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
              <Plus className="size-4" />
              {t('addRoom')}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
              {roomTypes.map((type) => (
                <DropdownMenuItem key={type.code} onClick={() => editor.addRoom(level, type.code)}>
                  {type.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="mx-1 h-5 w-px bg-border" aria-hidden />

          <Button
            size="icon-sm"
            variant="ghost"
            onClick={editor.undo}
            disabled={!editor.canUndo}
            aria-label={t('undo')}
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={editor.redo}
            disabled={!editor.canRedo}
            aria-label={t('redo')}
          >
            <Redo2 className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono tabular-nums">
            {formatArea(editor.measurements?.FLOOR_AREA)}
          </span>
          <Badge variant={errors.length ? 'destructive' : 'secondary'}>
            {t('score')} {editor.validation?.score ?? 0}
          </Badge>
        </div>
      </div>

      {}
      {editor.error ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="flex-1">{messageFor(editor.error.code, editor.error.message, t)}</p>
          <Button size="icon-sm" variant="ghost" onClick={editor.dismissError} aria-label={t('cancel')}>
            ×
          </Button>
        </div>
      ) : null}

      <PlanViewer
        house={editor.house}
        names={names}
        selectedRoomId={activeRoomId}
        onSelectRoom={setSelectedRoomId}
        onMoveSplit={(floorLevel, splitId, ratio) => {
          setLevel(floorLevel);
          editor.moveSplit(floorLevel, splitId, ratio);
        }}
        onMoveSplitEnd={editor.endMove}
        roomActions={
          selectedRoom ? (
            <RoomActions
              room={selectedRoom.room}
              roomTypes={roomTypes}
              onChangeType={(roomType) =>
                editor.changeRoomType(selectedRoom.level, selectedRoom.room.id, roomType)
              }
              onRename={(label) => editor.renameRoom(selectedRoom.level, selectedRoom.room.id, label)}
              onRemove={() => editor.removeRoom(selectedRoom.level, selectedRoom.room.id)}
            />
          ) : null
        }
      />

      {warnings.length || errors.length ? (
        <ul className="flex flex-wrap gap-2">
          {[...errors, ...warnings].map((issue, index) => (
            <li key={index}>
              <Badge variant={issue.severity === 'error' ? 'destructive' : 'secondary'}>
                {issueText(issue.code, issue.values)}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function messageFor(code: string, fallback: string, t: (key: string) => string): string {
  const known: Record<string, string> = {
    NO_SPACE: 'errors.noSpace',
    LAST_ROOM: 'errors.lastRoom',
    LEAF_NOT_FOUND: 'errors.notFound',
    SPLIT_NOT_FOUND: 'errors.notFound',
  };

  return known[code] ? t(known[code]) : fallback;
}
