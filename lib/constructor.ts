import { z } from 'zod';
import type { GenerateParams } from '@/types/domain';

export const EXTRA_KINDS = ['balcony', 'terrace', 'basement', 'sauna', 'pool'] as const;
export const MAX_FOOTPRINT_SHARE = 0.6;

export const RoomCountsSchema = z.record(
  z.string().min(2).max(40),
  z.number().int().min(0).max(20),
);

export interface RoomTypeLimit {
  code: string;
  min_area: number;
  max_count: number;
  default_count: number;
}

export const ParamsSchema = z.object({
  landAreaSotix: z.number().min(1).max(200),
  width: z.number().min(4).max(40),
  length: z.number().min(4).max(40),
  floors: z.number().int().min(1).max(3),
  rooms: RoomCountsSchema,
  kitchen: z.enum(['separate', 'combined']),
  garage: z.number().int().min(0).max(3),
  extras: z.array(z.enum(EXTRA_KINDS)),
  styleSlug: z.string().optional(),
  /** Chizmaning qaysi cheti shimolga qaraydi. Ixtiyoriy. */
  northSide: z.enum(['north', 'east', 'south', 'west']).optional(),
  variants: z.number().int().min(1).max(6),
  finishLevel: z.string(),
});

export const NORTH_SIDES = ['north', 'east', 'south', 'west'] as const;

export type ConstructorParams = z.infer<typeof ParamsSchema>;

export const DEFAULT_PARAMS: ConstructorParams = {
  landAreaSotix: 6,
  width: 12,
  length: 10,
  floors: 1,
  rooms: {},
  kitchen: 'separate',
  garage: 0,
  extras: [],
  variants: 4,
  finishLevel: 'standard',
};

export type ParamIssueCode =
  | 'ROOM_MAX_COUNT'
  | 'FOOTPRINT'
  | 'NO_ROOMS'
  | 'AREA_TOO_SMALL';

/**
 * A code, not a sentence.
 *
 * The screen renders it in the reader's language; Zod issues that come
 * from the schema already carry their own code as the message.
 */
export type ParamIssue = {
  field: keyof ConstructorParams | 'rooms';
  code: ParamIssueCode | string;
  values?: Record<string, string | number>;
};

export function validateParams(
  params: ConstructorParams,
  types: RoomTypeLimit[] = [],
): ParamIssue[] {
  const issues: ParamIssue[] = [];

  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        field: (issue.path[0] as keyof ConstructorParams) ?? 'width',
        code: issue.message,
      });
    }
  }

  for (const type of types) {
    const count = params.rooms[type.code] ?? 0;
    if (count > type.max_count) {
      issues.push({ field: 'rooms', code: 'ROOM_MAX_COUNT', values: { max: type.max_count } });
    }
  }

  if (footprintShare(params) > MAX_FOOTPRINT_SHARE) {
    issues.push({
      field: 'landAreaSotix',
      code: 'FOOTPRINT',
      values: { share: Math.round(MAX_FOOTPRINT_SHARE * 100) },
    });
  }

  if (totalRooms(params) === 0) {
    issues.push({ field: 'rooms', code: 'NO_ROOMS' });
  }

  const needed = minimumArea(params, types);
  const available = params.width * params.length * params.floors;

  if (needed > available) {
    issues.push({
      field: 'rooms',
      code: 'AREA_TOO_SMALL',
      values: { needed: Math.ceil(needed), available: Math.round(available) },
    });
  }

  return issues;
}

export function footprintShare(params: ConstructorParams): number {
  const land = params.landAreaSotix * 100;
  return land > 0 ? (params.width * params.length) / land : Infinity;
}

export function totalRooms(params: ConstructorParams): number {
  return Object.values(params.rooms).reduce((sum, count) => sum + count, 0);
}

function minimumArea(params: ConstructorParams, types: RoomTypeLimit[]): number {
  if (types.length === 0) return 0;

  const byCode = new Map(types.map((type) => [type.code, type.min_area]));

  let rooms = 0;
  for (const [code, count] of Object.entries(params.rooms)) {
    rooms += (byCode.get(code) ?? 0) * count;
  }

  const kitchen = params.kitchen === 'separate' ? (byCode.get('kitchen') ?? 8) : 0;

  return (rooms + kitchen) * 1.25;
}

const LEGACY_ROOM_KEYS: Record<string, string> = {
  yotoq: 'bedroom',
  mehmon: 'living',
  sanuzel: 'bathroom',
  ish: 'office',
  ovqat: 'dining',
};

export function toSearchParams(params: ConstructorParams): URLSearchParams {
  const search = new URLSearchParams({
    yer: String(params.landAreaSotix),
    eni: String(params.width),
    boyi: String(params.length),
    qavat: String(params.floors),
    oshxona: params.kitchen,
    garaj: String(params.garage),
    variant: String(params.variants),
    pardoz: params.finishLevel,
  });

  const rooms = Object.entries(params.rooms)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([code, count]) => `${code}:${count}`);

  if (rooms.length) search.set('xona', rooms.join(','));
  if (params.extras.length) search.set('qoshimcha', params.extras.join(','));
  if (params.styleSlug) search.set('uslub', params.styleSlug);
  if (params.northSide) search.set('shimol', params.northSide);

  return search;
}

export function fromSearchParams(search: URLSearchParams): ConstructorParams {
  const number = (key: string, fallback: number) => {
    const value = Number(search.get(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };

  const extras = (search.get('qoshimcha') ?? '')
    .split(',')
    .filter((value): value is (typeof EXTRA_KINDS)[number] =>
      (EXTRA_KINDS as readonly string[]).includes(value),
    );

  const kitchen = search.get('oshxona');

  return {
    landAreaSotix: number('yer', DEFAULT_PARAMS.landAreaSotix),
    width: number('eni', DEFAULT_PARAMS.width),
    length: number('boyi', DEFAULT_PARAMS.length),
    floors: number('qavat', DEFAULT_PARAMS.floors),
    rooms: roomsFrom(search),
    kitchen: kitchen === 'combined' ? 'combined' : 'separate',
    garage: intOrZero(search.get('garaj'), DEFAULT_PARAMS.garage),
    extras,
    styleSlug: search.get('uslub') ?? undefined,
    northSide: NORTH_SIDES.includes(search.get('shimol') as never)
      ? (search.get('shimol') as ConstructorParams['northSide'])
      : undefined,
    variants: number('variant', DEFAULT_PARAMS.variants),
    finishLevel: search.get('pardoz') || DEFAULT_PARAMS.finishLevel,
  };
}

function roomsFrom(search: URLSearchParams): Record<string, number> {
  const rooms: Record<string, number> = {};

  for (const pair of (search.get('xona') ?? '').split(',')) {
    const [code, raw] = pair.split(':');
    if (!code || !/^[a-z0-9_]{2,40}$/.test(code)) continue;

    const count = Number(raw);
    if (Number.isInteger(count) && count >= 0 && count <= 20) rooms[code] = count;
  }

  for (const [key, code] of Object.entries(LEGACY_ROOM_KEYS)) {
    if (code in rooms) continue;

    const count = Number(search.get(key));
    if (search.get(key) !== null && Number.isInteger(count) && count >= 0 && count <= 20) {
      rooms[code] = count;
    }
  }

  return rooms;
}

function intOrZero(raw: string | null, fallback: number): number {
  if (raw === null) return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

export function toGenerateParams(params: ConstructorParams): GenerateParams {
  return {
    landAreaSotix: params.landAreaSotix,
    width: params.width,
    length: params.length,
    floors: params.floors,
    rooms: params.rooms,
    kitchen: params.kitchen,
    garage: params.garage,
    extras: params.extras,
    styleSlug: params.styleSlug,
    ...(params.northSide ? { northSide: params.northSide } : {}),
    variants: params.variants,
    finishLevel: params.finishLevel,
  };
}
