'use client';

/**
 * Ildiz layout'ining o'zi yiqilganda.
 *
 * Bu chegara `[locale]/error.tsx` dan farq qiladi: u ildiz `<html>` ni
 * ham almashtiradi, ya'ni `next-intl` konteksti, mavzu va shriftlar
 * mavjud emas. Shu sababli bu yerda tarjima ham, umumiy komponentlar ham
 * ishlatilmaydi — hammasi shu faylda.
 *
 * Uchala tildagi matn birga ko'rsatiladi: qaysi til tanlanganini bilish
 * imkoni yo'q, foydalanuvchini esa tushunarsiz qoldirmaslik kerak.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="uz">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#ffffff',
          color: '#17131f',
          padding: '2rem',
        }}
      >
        <main style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Nimadir noto&apos;g&apos;ri ketdi
          </h1>
          <p style={{ color: '#4a4358', marginBottom: '0.25rem' }}>
            Что-то пошло не так · Something went wrong
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              border: '1px solid #17131f',
              background: '#17131f',
              color: '#ffffff',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Qayta urinish
          </button>

          {error.digest ? (
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#8b8698' }}>
              {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
