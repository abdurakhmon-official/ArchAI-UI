'use client';

import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Room } from '@/lib/geometry/types';

interface Props {
  room: Room;
  roomTypes: { code: string; name: string }[];
  onChangeType: (roomType: string) => void;
  onRename: (label: string) => void;
  onRemove: () => void;
}

export function RoomActions({ room, roomTypes, onChangeType, onRename, onRemove }: Props) {
  const t = useTranslations('editor');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(room.label ?? '');
  const input = useRef<HTMLInputElement>(null);

  const [lastRoom, setLastRoom] = useState({ id: room.id, label: room.label });

  if (lastRoom.id !== room.id || lastRoom.label !== room.label) {
    setLastRoom({ id: room.id, label: room.label });
    setEditing(false);
    setDraft(room.label ?? '');
  }

  useEffect(() => {
    if (editing) input.current?.focus();
  }, [editing]);

  const commit = () => {
    const value = draft.trim();
    setEditing(false);
    if (value !== (room.label ?? '')) onRename(value);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={input}
          value={draft}
          maxLength={40}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
            }
            if (event.key === 'Escape') {
              setDraft(room.label ?? '');
              setEditing(false);
            }
          }}
          className="h-8 w-40"
          aria-label={t('rename')}
        />
        <Button size="icon-sm" variant="ghost" onClick={commit} aria-label={t('save')}>
          <Check className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => {
            setDraft(room.label ?? '');
            setEditing(false);
          }}
          aria-label={t('cancel')}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
          {t('changeType')}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
          {roomTypes.map((type) => (
            <DropdownMenuItem
              key={type.code}
              onClick={() => onChangeType(type.code)}
              className={type.code === room.roomType ? 'font-semibold' : undefined}
            >
              {type.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)} aria-label={t('rename')}>
        <Pencil className="size-4" />
      </Button>

      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onRemove}
        aria-label={t('remove')}
        className="text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
