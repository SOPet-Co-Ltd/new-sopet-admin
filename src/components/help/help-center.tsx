'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HiChevronLeft, HiChevronRight, HiHome } from 'react-icons/hi2';
import { HelpMarkdown } from '@/components/help/help-markdown';
import { HelpPageShell } from '@/components/help/help-page-shell';
import { helpChipClass, HelpSearchField, stripDuplicateHelpTitle } from '@/components/help/help-ui';
import { cn } from '@/lib/utils';
import {
  GUIDE_HUB_PATH,
  getAdjacentArticles,
  getHelpSections,
  helpArticleHref,
  helpBasePath,
} from '@/lib/help/registry';
import type { HelpArticleMeta, HelpRole } from '@/lib/help/types';

type HelpCenterProps = {
  role: HelpRole;
  article: HelpArticleMeta;
  markdown: string;
};

function filterHelpArticles(sections: ReturnType<typeof getHelpSections>, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return sections
    .flatMap((section) => section.articles)
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q),
    )
    .slice(0, 8);
}

export function HelpCenter({ role, article, markdown }: HelpCenterProps) {
  const [query, setQuery] = useState('');
  const sections = getHelpSections(role);
  const { prev, next } = getAdjacentArticles(role, article.slug);
  const basePath = helpBasePath(role);
  const sectionArticles =
    sections.find((section) => section.section === article.section)?.articles ?? [];
  const searchResults = filterHelpArticles(sections, query);
  const bodyMarkdown = stripDuplicateHelpTitle(markdown, article.title);

  return (
    <HelpPageShell testId="help-center">
      <div className="mb-6 rounded-xl border border-border/80 bg-surface/60 px-4 py-3">
        <nav
          aria-label="เส้นทางคู่มือ"
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground"
        >
          <Link
            href={GUIDE_HUB_PATH}
            className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
          >
            <HiHome className="size-3.5" aria-hidden="true" />
            คู่มือ
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={basePath} className="hover:text-brand hover:underline">
            {role === 'admin' ? 'ผู้ดูแล' : 'ผู้ขาย'}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{article.section}</span>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{article.title}</span>
        </nav>
      </div>

      <header className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">
          {article.section}
        </p>
        <h1 className="font-display text-2xl font-semibold text-balance text-ink">
          {article.title}
        </h1>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">{article.description}</p>
      </header>

      <div className="relative mb-6">
        <HelpSearchField
          value={query}
          onChange={setQuery}
          placeholder="ค้นหาหัวข้ออื่นในคู่มือ..."
          ariaLabel="ค้นหาในคู่มือ"
        />
        {searchResults.length > 0 ? (
          <ul
            className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-[var(--shadow-card)]"
            role="listbox"
            aria-label="ผลการค้นหา"
          >
            {searchResults.map((item) => (
              <li key={item.slug} role="option" aria-selected={item.slug === article.slug}>
                <Link
                  href={helpArticleHref(role, item.slug)}
                  className="block px-4 py-2.5 text-sm transition-colors hover:bg-surface"
                  onClick={() => setQuery('')}
                >
                  <span className="font-medium text-ink">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {item.section} · {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {query.trim() && searchResults.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">ไม่พบหัวข้อที่ตรงกับคำค้น</p>
        ) : null}
      </div>

      {sectionArticles.length > 1 ? (
        <div className="mb-6 rounded-xl border border-border/80 bg-card p-3 shadow-sm">
          <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
            หัวข้อในหมวด {article.section}
          </p>
          <div
            className="-mx-0.5 flex flex-wrap gap-2"
            role="navigation"
            aria-label={`หัวข้อในหมวด ${article.section}`}
          >
            {sectionArticles.map((item) => {
              const active = item.slug === article.slug;
              return (
                <Link
                  key={item.slug}
                  href={helpArticleHref(role, item.slug)}
                  className={helpChipClass(active)}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <article className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
        <HelpMarkdown content={bodyMarkdown} />
      </article>

      {(prev || next) && (
        <nav aria-label="บทก่อนหน้าและถัดไป" className="mt-8 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={helpArticleHref(role, prev.slug)}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-brand/30 hover:bg-surface"
            >
              <HiChevronLeft className="mt-0.5 size-5 shrink-0 text-muted-foreground group-hover:text-brand" />
              <span className="min-w-0">
                <span className="block text-xs font-medium text-muted-foreground">ก่อนหน้า</span>
                <span className="mt-0.5 block font-medium text-ink group-hover:text-brand">
                  {prev.title}
                </span>
              </span>
            </Link>
          ) : (
            <div aria-hidden="true" />
          )}
          {next ? (
            <Link
              href={helpArticleHref(role, next.slug)}
              className="group flex items-start justify-end gap-3 rounded-xl border border-border bg-card p-4 text-right shadow-sm transition-colors hover:border-brand/30 hover:bg-surface sm:col-start-2"
            >
              <span className="min-w-0">
                <span className="block text-xs font-medium text-muted-foreground">ถัดไป</span>
                <span className="mt-0.5 block font-medium text-ink group-hover:text-brand">
                  {next.title}
                </span>
              </span>
              <HiChevronRight className="mt-0.5 size-5 shrink-0 text-muted-foreground group-hover:text-brand" />
            </Link>
          ) : null}
        </nav>
      )}

      <p className="mt-8 text-center">
        <Link
          href={basePath}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-brand',
            'hover:bg-brand/5',
          )}
        >
          ← กลับหน้าแรกคู่มือ
        </Link>
      </p>
    </HelpPageShell>
  );
}
