import api from '@/lib/axios';
import type { CatalogPriceItem } from '@/lib/price-book';
import type { SkeletonRow } from '@/lib/shared/generate';
import type {
  AdminBlogPost,
  AdminProject,
  BlogCategory,
  BlogPost,
  BlogPostDetail,
  FinishLevel,
  EstimateResult,
  EstimateSelection,
  ExportRequest,
  FaqGroup,
  FaqItem,
  GenerateParams,
  GenerateResult,
  GeometryState,
  JobStatus,
  Lead,
  MediaFile,
  OrphanFile,
  Payment,
  Plan,
  PaymentProvider,
  Project,
  ProjectSummary,
  PriceProfile,
  ProjectExportRow,
  ProjectVersion,
  SharedProject,
  ProviderStatus,
  RoofStyle,
  RoomType,
  SelectableRoomType,
  Skeleton,
  SkeletonInput,
  Style,
  Subscription,
  Translated,
  Variant,
} from '@/types/domain';

/**
 * Backend bilan ishlash.
 *
 * Mavjud `BaseService` naqshi CRUD uchun mo'ljallangan; bu yerdagi
 * endpointlarning ko'pi CRUD emas (generatsiya, geometriya amallari,
 * navbat), shuning uchun ular alohida yozilgan.
 *
 * Har bir metod javob o'ramini ochib, faqat `data` ni qaytaradi —
 * chaqiruvchi joyda `.data.data` yozish kerak bo'lmasin.
 */

const unwrap = async <T,>(promise: Promise<{ data: { data: T } }>): Promise<T> =>
  (await promise).data.data;

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

// --- Smeta -----------------------------------------------------------------

export const estimateService = {
  calculate(geometry: GeometryState, finishLevel: string, selection?: EstimateSelection) {
    return unwrap<EstimateResult>(api.post('/estimate', { geometry, finishLevel, selection }));
  },

  finishLevels() {
    return unwrap<FinishLevel[]>(api.get('/estimate/finish-levels'));
  },

  /**
   * Materiallar katalogi — kirgan foydalanuvchi uchun ochiq.
   *
   * Admin ro'yxatidan (`/price-items`) farqi: bu yerda faqat faol
   * bandlar va faol materiallar keladi. Admin nofaol qilgan material
   * foydalanuvchiga umuman ko'rinmasligi kerak.
   */
  priceItems() {
    return unwrap<CatalogPriceItem[]>(api.get('/estimate/price-items'));
  },
};

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

// --- Loyihalar -------------------------------------------------------------

export const projectService = {
  async list(query: { page?: number; limit?: number; search?: string } = {}) {
    const { data } = await api.get<{
      data: ProjectSummary[];
      meta: { page: number; limit: number; total: number; pages: number };
    }>('/projects', { params: query });

    return data;
  },

  byId(id: string) {
    return unwrap<Project>(api.get(`/projects/${id}`));
  },

  /** 403 `PLAN_LIMIT` bilan yiqilishi mumkin — `usePlanLimit` ushlaydi. */
  create(input: {
    title: string;
    note?: string | null;
    params: GenerateParams;
    geometry: GeometryState;
    styleSlug?: string | null;
    skeletonId?: string | null;
    finishLevel?: string;
  }) {
    return unwrap<Project>(api.post('/projects', input));
  },

  update(
    id: string,
    input: {
      title?: string;
      note?: string | null;
      geometry?: GeometryState;
      finishLevel?: string;
      selection?: EstimateSelection;
      versionLabel?: string;
    },
  ) {
    return unwrap<Project>(api.patch(`/projects/${id}`, input));
  },

  /**
   * Materiallar tanlovi — alohida uch.
   *
   * `update` dan farqi: bepul tarifda ham ishlaydi. Server tomonda
   * `RequirePlan('EDIT')` ataylab qo'yilmagan.
   */
  saveSelection(id: string, selection: EstimateSelection) {
    return unwrap<Project>(api.patch(`/projects/${id}/estimate`, { selection }));
  },

  remove(id: string) {
    return api.delete(`/projects/${id}`);
  },

  restore(id: string) {
    return api.post(`/projects/${id}/restore`);
  },

  versions(id: string) {
    return unwrap<ProjectVersion[]>(api.get(`/projects/${id}/versions`));
  },

  share(id: string) {
    return unwrap<{ token: string }>(api.post(`/projects/${id}/share`));
  },

  unshare(id: string) {
    return api.delete(`/projects/${id}/share`);
  },

  /** Ulashilgan loyiha — kirishsiz ochiladi. */
  shared(token: string) {
    return unwrap<SharedProject>(api.get(`/projects/shared/${encodeURIComponent(token)}`));
  },

  restoreVersion(id: string, versionId: string) {
    return unwrap<Project>(api.post(`/projects/${id}/versions/${versionId}/restore`));
  },

  recalculate(id: string) {
    return unwrap<Project>(api.post(`/projects/${id}/recalculate`));
  },

  /** Tayyor bo'lsa havola, aks holda navbat identifikatori qaytadi. */
  requestPdf(id: string, locale = 'uz') {
    return unwrap<ExportRequest>(api.post(`/projects/${id}/pdf`, {}, { params: { locale } }));
  },

  requestRender(id: string, view: 'exterior' | 'cutaway' | 'interior' = 'exterior') {
    return unwrap<ExportRequest>(api.post(`/projects/${id}/render`, {}, { params: { view } }));
  },
};

/**
 * Foydalanuvchining o'z narxlari.
 *
 * Materiallar tanlovi loyihaga bog'langan edi: o'z pudratchisining
 * narxlarini biladigan odam har yangi loyihada ularni qaytadan
 * kiritardi.
 */
export const priceProfileService = {
  list() {
    return unwrap<PriceProfile[]>(api.get('/price-profiles'));
  },

  create(input: { name: string; selection: EstimateSelection }) {
    return unwrap<PriceProfile>(api.post('/price-profiles', input));
  },

  update(id: string, input: { name: string; selection: EstimateSelection }) {
    return unwrap<PriceProfile>(api.put(`/price-profiles/${id}`, input));
  },

  remove(id: string) {
    return api.delete(`/price-profiles/${id}`);
  },
};

// --- Navbat ----------------------------------------------------------------

export const jobService = {
  status(jobId: string) {
    return unwrap<JobStatus>(api.get(`/jobs/${encodeURIComponent(jobId)}`));
  },
};

// --- Tarif va to'lov -------------------------------------------------------

export const billingService = {
  plans() {
    return unwrap<Plan[]>(api.get('/billing/plans'));
  },

  providers() {
    return unwrap<ProviderStatus[]>(api.get('/billing/providers'));
  },

  subscription() {
    return unwrap<{ subscription: Subscription | null; payments: Payment[] }>(
      api.get('/billing/subscription'),
    );
  },

  checkout(planCode: string, provider: PaymentProvider, months = 1) {
    return unwrap<{
      provider: PaymentProvider;
      subscriptionId: string;
      amount: number;
      currency: string;
      redirectUrl: string;
    }>(api.post('/billing/checkout', { planCode, provider, months }));
  },

  cancel(subscriptionId: string) {
    return api.delete(`/billing/subscription/${subscriptionId}`);
  },
};

// --- Kontent ---------------------------------------------------------------

export const contentService = {
  async posts(query: { page?: number; limit?: number; category?: string } = {}) {
    const { data } = await api.get<{
      data: BlogPost[];
      meta: { page: number; limit: number; total: number; pages: number };
    }>('/blog', { params: query });

    return data;
  },

  post(slug: string) {
    return unwrap<BlogPostDetail>(api.get(`/blog/${slug}`));
  },

  categories() {
    return unwrap<BlogCategory[]>(api.get('/blog/categories'));
  },

  faq() {
    return unwrap<FaqGroup[]>(api.get('/faq'));
  },

  lead(input: { name: string; phone: string; message?: string; source?: string; payload?: unknown }) {
    return api.post('/leads', input);
  },
};

/**
 * Blog, FAQ va murojaatlar — admin.
 *
 * Blog ro'yxati uchun alohida uch YO'Q: `/blog` admin tokeni bilan
 * chaqirilsa qoralamalarni ham qaytaradi (`OptionalAuth`). Shuning
 * uchun bu yerda faqat holat bo'yicha filtr qo'shiladi.
 */
export const contentAdminService = {
  posts(query: { page?: number; limit?: number; search?: string; status?: string } = {}) {
    return api
      .get<{
        data: AdminBlogPost[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>('/blog', { params: query })
      .then((response) => response.data);
  },

  post(slug: string) {
    return unwrap<BlogPostDetail>(api.get(`/blog/${slug}`));
  },

  createPost(input: object) {
    return unwrap<AdminBlogPost>(api.post('/blog', input));
  },

  updatePost(id: string, input: object) {
    return unwrap<AdminBlogPost>(api.put(`/blog/${id}`, input));
  },

  removePost(id: string) {
    return api.delete(`/blog/${id}`);
  },

  createCategory(input: { slug: string; name: Translated }) {
    return unwrap<{ id: string; slug: string; name: Translated }>(api.post('/blog/categories', input));
  },

  removeCategory(id: string) {
    return api.delete(`/blog/categories/${id}`);
  },

  // --- FAQ ---
  createFaq(input: object) {
    return unwrap<FaqItem>(api.post('/faq', input));
  },

  updateFaq(id: string, input: object) {
    return unwrap<FaqItem>(api.put(`/faq/${id}`, input));
  },

  removeFaq(id: string) {
    return api.delete(`/faq/${id}`);
  },

  /**
   * Tartibni yangilash.
   *
   * Tana obyekt: yuqori darajadagi massiv serverga umuman yetib
   * bormaydi (`FaqReorderSchema` izohiga qarang).
   */
  reorderFaq(items: Array<{ id: string; sort: number }>) {
    return api.put('/faq/reorder', { items });
  },

  // --- Murojaatlar ---
  leads(query: { page?: number; status?: string } = {}) {
    return api
      .get<{
        data: Lead[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>('/leads', { params: query })
      .then((response) => response.data);
  },

  updateLead(id: string, input: { status?: string; admin_note?: string | null }) {
    return unwrap<Lead>(api.put(`/leads/${id}`, input));
  },

  removeLead(id: string) {
    return api.delete(`/leads/${id}`);
  },
};

// --- Admin ------------------------------------------------------------------

export interface AdminStats {
  users: number;
  newUsers: number;
  projects: number;
  newProjects: number;
  activeSubscriptions: number;
  openLeads: number;
  /** Prisma `Decimal` — satr bo'lishi mumkin, `toNumber()` shart. */
  revenue30d: string | number;
}

/**
 * Admin uchlari.
 *
 * Hammasi `@Authorized(AdminOnly())` bilan himoyalangan; oddiy
 * foydalanuvchi 403 oladi va `lib/axios.ts` uni toast qiladi.
 */
export const adminService = {
  stats() {
    return unwrap<AdminStats>(api.get('/dashboard/admin'));
  },
};

// --- Admin: narx bazasi -----------------------------------------------------

export interface AdminPriceOption {
  id: string;
  code: string;
  name: Translated;
  description: Translated | null;
  /** Prisma `Decimal` — SATR bo'lib keladi. */
  unit_price: string;
  image_url: string | null;
  sort: number;
  active: boolean;
}

export interface AdminPriceItem {
  id: string;
  code: string;
  category: string;
  name: Translated;
  unit: string;
  unit_price: string;
  measure: string;
  sort: number;
  active: boolean;
  options: AdminPriceOption[];
}

export interface FinishPreset {
  id: string;
  code: string;
  name: Translated;
  defaults: Record<string, string>;
  sort: number;
}

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
 * Loyihalar — admin.
 *
 * `projectService.list()` faqat o'z loyihalarini beradi va bu ataylab
 * qat'iy: `user_id` filtri u yerda hech qachon olib tashlanmaydi.
 * Admin ro'yxati alohida uch orqali keladi.
 */
export const projectAdminService = {
  list(query: { page?: number; search?: string; deleted?: string } = {}) {
    return api
      .get<{
        data: AdminProject[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>('/projects/all', { params: query })
      .then((response) => response.data);
  },

  remove(id: string) {
    return api.delete(`/projects/${id}`);
  },

  restore(id: string) {
    return api.post(`/projects/${id}/restore`);
  },
};

/**
 * Media kutubxonasi — admin.
 *
 * Yetim fayl — bazadagi yozuvi bor, lekin hech qayerda ishlatilmayotgan
 * fayl: uslub muqovasi almashtirilgan, maqola o'chirilgan va hokazo.
 * Ular o'z-o'zidan yo'qolmaydi va vaqt o'tib saqlash joyini yeydi.
 */
export const mediaService = {
  list(query: { page?: number; limit?: number; type?: string; search?: string } = {}) {
    return api
      .get<{
        data: MediaFile[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>('/s3/media', { params: query })
      .then((response) => response.data);
  },

  orphans(days = 7) {
    return api
      .get<{ data: OrphanFile[]; meta?: { count: number; bytes: number } }>('/s3/media/orphans', {
        params: { days },
      })
      .then((response) => response.data);
  },

  purgeOrphans(days = 7) {
    return unwrap<{ removed: number }>(api.delete('/s3/media/orphans', { params: { days } }));
  },

  remove(id: string) {
    return api.delete(`/s3/media/${id}`);
  },
};

/**
 * Loyiha eksportlari — PDF va 3D rasmlar.
 *
 * Media kutubxonasidan alohida: bular kesh va muddati o'tgach o'zi
 * o'chadi. Bir ro'yxatga qo'shilsa "yetim fayl" hisobi buzilardi.
 */
export const exportAdminService = {
  list(query: { page?: number; kind?: string; search?: string } = {}) {
    return api
      .get<{
        data: ProjectExportRow[];
        meta: { page: number; limit: number; total: number; pages: number; bytes: number };
      }>('/exports', { params: query })
      .then((response) => response.data);
  },

  remove(id: string) {
    return api.delete(`/exports/${id}`);
  },

  purgeExpired() {
    return unwrap<{ removed: number }>(api.delete('/exports/expired'));
  },
};

// --- Admin: jurnal, tariflar, foydalanuvchilar -----------------------------

export interface AuditEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  diff: Record<string, { from: unknown; to: unknown }> | null;
  created_at: string;
  actor: { id: string; fullName: string; email: string } | null;
}

export const auditService = {
  async list(query: { page?: number; entity?: string; action?: string } = {}) {
    const { data } = await api.get<{
      data: AuditEntry[];
      meta: { page: number; limit: number; total: number; pages: number };
    }>('/audit', { params: query });

    return data;
  },

  facets() {
    return unwrap<{ entities: string[]; actions: string[] }>(api.get('/audit/facets'));
  },
};

export interface AdminPlan extends Plan {
  active: boolean;
  _count?: { subscriptions: number };
}

export interface AdminSubscription {
  id: string;
  status: string;
  provider: PaymentProvider | null;
  period_start: string | null;
  period_end: string | null;
  auto_renew: boolean;
  created_at: string;
  plan: { code: string; name: Translated };
  user: { id: string; fullName: string; email: string } | null;
  payments: { status: string; amount: string; currency: string; paid_at: string | null }[];
}

export const planAdminService = {
  list() {
    return unwrap<AdminPlan[]>(api.get('/plans'));
  },

  async subscriptions(page = 1) {
    const { data } = await api.get<{
      data: AdminSubscription[];
      meta: { page: number; limit: number; total: number; pages: number };
    }>('/plans/subscriptions', { params: { page } });

    return data;
  },

  update(id: string, input: object) {
    return unwrap<AdminPlan>(api.put(`/plans/${id}`, input));
  },

  deactivate(id: string) {
    return unwrap<AdminPlan>(api.delete(`/plans/${id}`));
  },
};

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: 'ADMIN' | 'ARCHITECT' | 'USER';
  active: boolean;
  email_verified: boolean;
  created_at: string;
}

export const userAdminService = {
  /**
   * DIQQAT: bu uch boshqa o'ram ishlatadi — `{ data: { items, count } }`.
   *
   * Qolgan uchlar `{ data, meta }` beradi. Farq eski koddan qolgan va
   * uni bu yerda tekislaymiz, chunki chaqiruvchi joyda ikki xil shakl
   * bilan ishlash xatoga olib keladi.
   */
  async list(query: { page?: number; search?: string; size?: number } = {}) {
    const { data } = await api.get<{ data: { items: AdminUser[]; count: number } }>(
      '/users/paginated',
      { params: query },
    );

    return { items: data.data.items, total: data.data.count };
  },

  setRole(id: string, role: AdminUser['role']) {
    return unwrap<AdminUser>(api.put(`/users/${id}/role`, { role }));
  },

  remove(id: string) {
    return api.delete(`/users/${id}`);
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

export const priceAdminService = {
  items() {
    return unwrap<AdminPriceItem[]>(api.get('/price-items'));
  },

  impact() {
    return unwrap<{ projects: number; withOwnSelection: number }>(api.get('/price-items/impact'));
  },

  updateItem(id: string, input: { unit_price?: number; sort?: number; active?: boolean }) {
    return unwrap<AdminPriceItem>(api.put(`/price-items/${id}`, input));
  },

  createOption(
    itemId: string,
    input: { code: string; name: Translated; unit_price: number; sort?: number },
  ) {
    return unwrap<AdminPriceOption>(api.post(`/price-items/${itemId}/options`, input));
  },

  updateOption(optionId: string, input: { unit_price?: number; name?: Translated; active?: boolean }) {
    return unwrap<AdminPriceOption>(api.put(`/price-items/options/${optionId}`, input));
  },

  deleteOption(optionId: string) {
    return api.delete(`/price-items/options/${optionId}`);
  },

  finishLevels() {
    return unwrap<FinishPreset[]>(api.get('/finish-levels'));
  },

  updateFinishLevel(code: string, defaults: Record<string, string>) {
    return unwrap<FinishPreset>(api.put(`/finish-levels/${code}`, { defaults }));
  },
};
