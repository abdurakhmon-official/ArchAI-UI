import api from '@/lib/axios';
import type { SkeletonRow } from '@/lib/shared/generate';
import { unwrap } from '@/lib/services/unwrap';
import type { RoofStyle, RoomType, SelectableRoomType, Skeleton, SkeletonInput, Style } from '@/types/domain';

// --- Katalog ---------------------------------------------------------------

export const catalogService = {
  styles() {
    return unwrap<Style[]>(api.get('/styles'));
  },

  style(slug: string) {
    return unwrap<Style>(api.get(`/styles/${slug}`));
  },

  roomTypes() {
    return unwrap<RoomType[]>(api.get('/room-types'));
  },

  /** Konstruktorda so'raladiganlari — chegaralari bilan. */
  selectableRoomTypes() {
    return unwrap<SelectableRoomType[]>(api.get('/room-types/selectable'));
  },

  /**
   * Chop etilgan andozalar — jonli preview uchun.
   *
   * Ro'yxat kichik va kamdan kam o'zgaradi, shuning uchun uzoq
   * keshlanadi: preview har o'zgarishda uni qayta so'ramaydi.
   */
  skeletons() {
    return unwrap<SkeletonRow[]>(api.get('/skeletons/published'));
  },
};

/**
 * Tom uslublari.
 *
 * `families()` — geometriya qo'llaydigan shakllar ro'yxati. U koddan
 * keladi va admin uni ko'paytira olmaydi; preset esa cheksiz.
 */
export const roofStyleService = {
  listPublished() {
    return unwrap<RoofStyle[]>(api.get('/roof-styles'));
  },

  listAll() {
    return unwrap<RoofStyle[]>(api.get('/roof-styles/all'));
  },

  families() {
    return unwrap<string[]>(api.get('/roof-styles/families'));
  },

  create(input: object) {
    return unwrap<RoofStyle>(api.post('/roof-styles', input));
  },

  update(id: string, input: object) {
    return unwrap<RoofStyle>(api.put(`/roof-styles/${id}`, input));
  },

  remove(id: string) {
    return api.delete(`/roof-styles/${id}`);
  },
};

/**
 * Uy uslublari — admin.
 *
 * `catalogService.styles()` faqat CHOP ETILGANLARINI beradi, chunki uni
 * ochiq sahifalar ishlatadi. Adminga qoralamalar ham kerak, shuning
 * uchun alohida uch.
 */
export const styleAdminService = {
  listAll() {
    return unwrap<Style[]>(api.get('/styles/all'));
  },

  create(input: object) {
    return unwrap<Style>(api.post('/styles', input));
  },

  update(id: string, input: object) {
    return unwrap<Style>(api.put(`/styles/${id}`, input));
  },

  remove(id: string) {
    return api.delete(`/styles/${id}`);
  },
};

/**
 * Andozalar — admin.
 *
 * Andoza bu bo'linish daraxti: generator undan boshlab xonalarni
 * so'ralgan songa keltiradi. Uning sifati butun mahsulotga ta'sir
 * qiladi — yomon andoza yomon reja beradi.
 */
export const skeletonAdminService = {
  list() {
    return unwrap<Skeleton[]>(api.get('/skeletons', { params: { drafts: true } }));
  },

  create(input: SkeletonInput) {
    return unwrap<Skeleton>(api.post('/skeletons', input));
  },

  update(id: string, input: SkeletonInput) {
    return unwrap<Skeleton>(api.put(`/skeletons/${id}`, input));
  },

  duplicate(id: string) {
    return unwrap<Skeleton>(api.post(`/skeletons/${id}/duplicate`));
  },

  remove(id: string) {
    return api.delete(`/skeletons/${id}`);
  },
};

/**
 * Xona turlari — admin.
 *
 * `catalogService.roomTypes()` ochiq ro'yxatni beradi; yozish esa
 * `AdminOnly` bilan qo'riqlanadi va shu sababli alohida turadi.
 */
export const roomTypeAdminService = {
  update(
    id: string,
    input: {
      min_area?: number;
      max_area?: number;
      max_count?: number;
      default_count?: number;
      selectable?: boolean;
      sort?: number;
    },
  ) {
    return unwrap<RoomType>(api.put(`/room-types/${id}`, input));
  },
};
