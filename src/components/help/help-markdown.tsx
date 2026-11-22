'use client';

import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import Link from 'next/link';

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function childrenToText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(childrenToText).join('');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    return childrenToText((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return '';
}

const helpMarkdownComponents: Components = {
  h1: ({ children }) => {
    const text = childrenToText(children);
    const id = slugifyHeading(text);
    return (
      <h1 id={id} className="font-display text-2xl font-semibold text-ink mt-0 mb-4 scroll-mt-24">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const text = childrenToText(children);
    const id = slugifyHeading(text);
    return (
      <h2
        id={id}
        className="font-display text-lg font-semibold text-ink mt-10 mb-3 scroll-mt-24 border-t border-border/80 pt-8 first:mt-0 first:border-t-0 first:pt-0"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const text = childrenToText(children);
    const id = slugifyHeading(text);
    return (
      <h3 id={id} className="font-display text-lg font-medium text-ink mt-6 mb-2 scroll-mt-24">
        {children}
      </h3>
    );
  },
  p: ({ children, node }) => {
    // react-markdown wraps standalone images in <p>. Our img renderer returns a
    // block <figure>, which is invalid inside <p> and causes hydration errors.
    // Check the hast node (not rendered props) — the child is still an `img`
    // element type before our custom component expands to <figure>.
    const meaningful =
      node?.children?.filter((child) => {
        if (child.type === 'text') {
          return Boolean(child.value.trim());
        }
        return true;
      }) ?? [];
    if (
      meaningful.length === 1 &&
      meaningful[0]?.type === 'element' &&
      meaningful[0].tagName === 'img'
    ) {
      return <>{children}</>;
    }
    return <p className="text-sm leading-relaxed text-ink mb-3 last:mb-0">{children}</p>;
  },
  ul: ({ children }) => (
    <ul className="list-disc pl-5 list-outside text-sm text-ink mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 list-outside text-sm text-ink mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-8 border-border" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand/40 bg-surface pl-4 py-2 my-4 text-sm text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className?.includes('language-'));
    if (isBlock) {
      return (
        <code className="block whitespace-pre overflow-x-auto rounded-lg bg-surface p-4 text-xs text-ink">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-surface px-1.5 py-0.5 text-xs font-mono text-ink">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="mb-4 overflow-x-auto">{children}</pre>,
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-border px-3 py-2 text-left font-medium text-ink">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 align-top text-ink">{children}</td>
  ),
  a: ({ children, href }) => {
    if (!href) {
      return <span>{children}</span>;
    }
    const isInternal = href.startsWith('/');
    if (isInternal) {
      return (
        <Link href={href} className="text-brand underline underline-offset-2">
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className="text-brand underline underline-offset-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => {
    if (!src) return null;
    const caption = alt?.trim() || 'ภาพหน้าจอประกอบคู่มือ';
    return (
      <figure className="my-6 overflow-hidden rounded-xl border border-border bg-surface ring-1 ring-black/5">
        <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
          <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
            ภาพหน้าจอ
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- help screenshots from /public/help */}
        <img
          src={src}
          alt={caption}
          loading="lazy"
          className="block h-auto w-full max-w-full bg-white"
        />
        <figcaption className="border-t border-border px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      </figure>
    );
  },
};

type HelpMarkdownProps = {
  content: string;
};

export function HelpMarkdown({ content }: HelpMarkdownProps) {
  return (
    <div data-testid="help-markdown" className="help-markdown prose-width max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={helpMarkdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
