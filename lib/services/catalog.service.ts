import api from '@/lib/axios';
import type { SkeletonRow } from '@/lib/shared/generate';
import { unwrap } from '@/lib/services/unwrap';
import type { RoofStyle, RoomType, SelectableRoomType, Skeleton, SkeletonInput, Style } from '@/types/domain';

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

  selectableRoomTypes() {
    return unwrap<SelectableRoomType[]>(api.get('/room-types/selectable'));
  },

  skeletons() {
    return unwrap<SkeletonRow[]>(api.get('/skeletons/published'));
  },
};

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

export const roomTypeAdminService = {
  update(
    id: string,
    input: {
      minArea?: number;
      maxArea?: number;
      maxCount?: number;
      defaultCount?: number;
      selectable?: boolean;
      sort?: number;
    },
  ) {
    return unwrap<RoomType>(api.put(`/room-types/${id}`, input));
  },
};
