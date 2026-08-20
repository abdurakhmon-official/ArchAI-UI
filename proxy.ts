import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

/**
 * So'rov oldidan bajariladigan kod.
 *
 * DIQQAT: Next.js 16 da bu fayl `middleware.ts` emas, `proxy.ts` deb
 * ataladi. Funksiya imzosi o'zgarmagan — faqat nom va konvensiya.
 *
 * Ikki vazifa: til prefiksini qo'yish va kabinet sahifalarini himoyalash.
 */

const intl = createIntlMiddleware(routing);

/** Kirmagan foydalanuvchiga yopiq bo'limlar (til prefiksisiz). */
const PROTECTED = ['/kabinet', '/dashboard', '/loyiha', '/proekt', '/project'];

/** Kirgan foydalanuvchiga keraksiz sahifalar. */
const GUEST_ONLY = ['/kirish', '/vhod', '/sign-in', '/royxatdan-otish', '/registratsiya', '/sign-up'];

/** Faqat adminga ochiq bo'lim. Manzil uchala tilda bir xil. */
const ADMIN_ONLY = ['/admin'];

export function proxy(request: NextRequest) {
  // Avval til: prefiks qo'yilmagan bo'lsa, `intl` yo'naltiradi va
  // keyingi tekshiruvlar to'g'ri manzil ustida ishlaydi.
  const response = intl(request);

  if (response.headers.get('location')) return response;

  const { pathname } = request.nextUrl;
  const withoutLocale = stripLocale(pathname);
  const token = request.cookies.get('token')?.value;

  if (!token && PROTECTED.some((path) => withoutLocale.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localeOf(pathname)}${localized('/sign-in', localeOf(pathname))}`;
    /*
      Kirgandan keyin qayerga qaytishni eslab qolamiz — QIDIRUV
      PARAMETRLARI bilan birga. Konstruktorda butun loyiha holati
      shularda turadi va faqat `pathname` saqlansa foydalanuvchi bo'sh
      sahifaga qaytardi.
    */
    url.searchParams.set('next', pathname + request.nextUrl.search);

    return NextResponse.redirect(url);
  }

  /**
   * Admin bo'limi.
   *
   * Token ichidagi `role` o'qiladi, lekin IMZO TEKSHIRILMAYDI — bu
   * ataylab. Bu yerdagi tekshiruv faqat foydalanuvchiga to'g'ri sahifa
   * ko'rsatish uchun; haqiqiy qo'riqchi — API tomonidagi
   * `@Authorized(AdminOnly())`, u imzoni ham, foydalanuvchi hali
   * mavjudligini ham tekshiradi. Soxta token bilan bu yerdan o'tib
   * olgan odam API'dan birorta ma'lumot ololmaydi.
   */
  if (ADMIN_ONLY.some((path) => withoutLocale.startsWith(path))) {
    if (roleFrom(token) !== 'ADMIN') {
      const locale = localeOf(pathname);
      const url = request.nextUrl.clone();
      url.search = '';

      if (!token) {
        url.pathname = `/${locale}${localized('/sign-in', locale)}`;
        url.searchParams.set('next', pathname);
      } else {
        // Kirgan, lekin admin emas — kirish sahifasiga yuborish
        // chalkash bo'lardi, chunki u allaqachon kirgan.
        url.pathname = `/${locale}${localized('/dashboard', locale)}`;
      }

      return NextResponse.redirect(url);
    }
  }

  if (token && GUEST_ONLY.some((path) => withoutLocale.startsWith(path))) {
    const locale = localeOf(pathname);
    const url = request.nextUrl.clone();
    // Kabinet manzili ham tarjima qilingan (`en` da `/dashboard`) —
    // qat'iy `/dashboard` yozilsa, inglizcha versiyada sahifa topilmaydi.
    url.pathname = `/${locale}${localized('/dashboard', locale)}`;
    url.search = '';

    return NextResponse.redirect(url);
  }

  return response;
}

// ---------------------------------------------------------------------------

/**
 * JWT ichidagi rolni o'qish — imzosiz.
 *
 * `jose` kabi kutubxona bilan imzoni ham tekshirish mumkin edi, lekin
 * u yerda maxfiy kalit kerak bo'lardi va u har so'rovda ishlab, hech
 * qanday qo'shimcha himoya bermasdi: bu yerda faqat yo'naltirish hal
 * qilinadi, ma'lumot berilmaydi.
 *
 * Buzilgan yoki muddati o'tgan token uchun `null` qaytadi.
 */
function roleFrom(token: string | undefined): string | null {
  if (!token) return null;

  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const json = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
    ) as { role?: string; exp?: number };

    // Muddati o'tgan token bilan panel ochilmasin — API baribir 401 beradi.
    if (typeof json.exp === 'number' && json.exp * 1000 < Date.now()) return null;

    return json.role ?? null;
  } catch {
    return null;
  }
}

function localeOf(pathname: string): string {
  const [, first] = pathname.split('/');
  return routing.locales.includes(first as never) ? first : routing.defaultLocale;
}

function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  if (!routing.locales.includes(first as never)) return pathname;

  return `/${rest.join('/')}`;
}

/** Marshrutning shu tildagi shakli. */
function localized(route: keyof typeof routing.pathnames, locale: string): string {
  const entry = routing.pathnames[route];
  if (typeof entry === 'string') return entry;

  return (entry as Record<string, string>)[locale] ?? route;
}

export const config = {
  /**
   * Statik fayllar va API so'rovlariga tegmaymiz. `_next` va nuqtali
   * fayllar (`favicon.ico`, `robots.txt`) ham chetlab o'tiladi.
   */
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
