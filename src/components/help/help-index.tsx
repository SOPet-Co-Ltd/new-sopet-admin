'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HiBookOpen, HiChevronRight } from 'react-icons/hi2';
import { HelpPageShell } from '@/components/help/help-page-shell';
import { helpChipClass, HelpSearchField } from '@/components/help/help-ui';
import { getHelpSections, helpArticleHref } from '@/lib/help/registry';
import type { HelpRole } from '@/lib/help/types';

type HelpIndexProps = {
  role: HelpRole;
  title: string;
  description: string;
};

function filterHelpSections(
  sections: ReturnType<typeof getHelpSections>,
  query: string,
  activeSection: string | 'all',
) {
  const q = query.trim().toLowerCase();
  return sections
    .filter((section) => activeSection === 'all' || section.section === activeSection)
    .map((section) => ({
      ...section,
      articles: section.articles.filter(
        (item) =>
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q),
      ),
    }))
    .filter((section) => section.articles.length > 0);
}

export function HelpIndex({ role, title, description }: HelpIndexProps) {
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | 'all'>('all');
  const sections = getHelpSections(role);
  const filteredSections = filterHelpSections(sections, query, activeSection);
  const totalArticles = filteredSections.reduce((n, s) => n + s.articles.length, 0);

  return (
    <HelpPageShell testId="help-index">
      <div className="mb-8 flex gap-4 rounded-xl border border-border/80 bg-gradient-to-br from-brand/5 via-card to-card p-5 shadow-sm sm:p-6">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"
          aria-hidden
        >
          <HiBookOpen className="size-6" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-balance text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{description}</p>
        </div>
      </div>

      <HelpSearchField
        value={query}
        onChange={setQuery}
        placeholder="ค้นหาหัวข้อในคู่มือ..."
        ariaLabel="ค้นหาหัวข้อในคู่มือ"
        className="mb-4 max-w-xl sm:max-w-2xl"
      />

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="หมวดคู่มือ">
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'all'}
          className={helpChipClass(activeSection === 'all')}
          onClick={() => setActiveSection('all')}
        >
          ทั้งหมด
        </button>
        {sections.map((section) => (
          <button
            key={section.section}
            type="button"
            role="tab"
            aria-selected={activeSection === section.section}
            className={helpChipClass(activeSection === section.section)}
            onClick={() => setActiveSection(section.section)}
          >
            {section.section}
          </button>
        ))}
      </div>

      {filteredSections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-8 text-center text-sm text-muted-foreground">
          ไม่พบหัวข้อที่ตรงกับคำค้น
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs text-muted-foreground">
            แสดง {totalArticles.toLocaleString('th-TH')} หัวข้อ
          </p>
          <div className="grid gap-8 xl:grid-cols-2 xl:items-start">
            {filteredSections.map((section) => (
              <section key={section.section} id={`help-section-${section.section}`}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold text-ink">{section.section}</h2>
                  <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {section.articles.length} หัวข้อ
                  </span>
                </div>
                <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
                  {section.articles.map((article, index) => (
                    <li
                      key={article.slug}
                      className={index > 0 ? 'border-t border-border' : undefined}
                    >
                      <Link
                        href={helpArticleHref(role, article.slug)}
                        className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface sm:px-5"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-ink group-hover:text-brand">
                            {article.title}
                          </h3>
                          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground sm:line-clamp-1">
                            {article.description}
                          </p>
                        </div>
                        <HiChevronRight
                          className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </HelpPageShell>
  );
}
