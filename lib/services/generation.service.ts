import api from '@/lib/axios';
import { unwrap } from '@/lib/services/unwrap';
import type { GenerateParams, GenerateResult, GeometryState, Variant } from '@/types/domain';

// --- Generatsiya -----------------------------------------------------------

export const generationService = {
  /**
   * Variantlar yaratish.
   *
   * Token bo'lsa axios uni o'zi qo'shadi: mehmon 1 ta variant oladi,
   * kirgan foydalanuvchi tarifi bo'yicha ko'proq.
   */
  async generate(params: GenerateParams): Promise<GenerateResult> {
    const { data } = await api.post<{
      data: Variant[];
      meta: { count: number; relaxed: boolean; message?: string; variantLimit: number };
    }>('/generate', params);

    return { variants: data.data, ...data.meta };
  },
};

// --- Geometriya ------------------------------------------------------------

/**
 * Tahrirlash amallari.
 *
 * DIQQAT: bular saqlashdan oldingi tekshiruv uchun. Jonli tahrirlash
 * brauzerda `lib/geometry` bilan bajariladi — har devor surilganda
 * serverga borish sekin va foydalanuvchi buni sezadi.
 */
export const geometryService = {
  addRoom(geometry: GeometryState, level: number, roomType: string) {
    return unwrap<GeometryState>(api.post('/geometry/room/add', { geometry, level, roomType }));
  },

  removeRoom(geometry: GeometryState, level: number, roomId: string) {
    return unwrap<GeometryState>(api.post('/geometry/room/remove', { geometry, level, roomId }));
  },

  changeRoomType(geometry: GeometryState, level: number, roomId: string, roomType: string) {
    return unwrap<GeometryState>(
      api.post('/geometry/room/type', { geometry, level, roomId, roomType }),
    );
  },

  moveWall(geometry: GeometryState, level: number, splitId: string, ratio: number) {
    return unwrap<GeometryState>(api.post('/geometry/wall/move', { geometry, level, splitId, ratio }));
  },

  resize(geometry: GeometryState, width: number, length: number) {
    return unwrap<GeometryState>(api.post('/geometry/resize', { geometry, width, length }));
  },
};
