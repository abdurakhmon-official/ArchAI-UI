'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4 leading-relaxed', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{children}</h2>
          ),
          h2: ({ children }) => (
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="mt-1 text-lg font-semibold">{children}</h3>,
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul className="flex list-disc flex-col gap-1 ps-5">{children}</ul>,
          ol: ({ children }) => (
            <ol className="flex list-decimal flex-col gap-1 ps-5">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-s-2 ps-4 text-muted-foreground">{children}</blockquote>
          ),
          
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ children, className: lang }) =>
            lang ? (
              <code className="font-mono text-sm">{children}</code>
            ) : (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">{children}</code>
            ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4">{children}</pre>
          ),
          hr: () => <hr className="border-t" />,
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b px-3 py-2 text-start font-medium">{children}</th>
          ),
          td: ({ children }) => <td className="border-b px-3 py-2">{children}</td>,
          
          img: ({ src, alt }) =>
            typeof src === 'string' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ''} loading="lazy" className="max-w-full rounded-lg" />
            ) : null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
