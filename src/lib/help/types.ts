export type HelpRole = 'admin' | 'vendor';

export type HelpArticleMeta = {
  /** URL slug under /guide/admin/[slug] or /guide/vendor/[slug] */
  slug: string;
  /** Thai title shown in TOC and page header */
  title: string;
  /** Section group label in TOC */
  section: string;
  role: HelpRole;
  /** Sort order within the role book (lower first) */
  order: number;
  /** Short description for index cards */
  description: string;
  /**
   * Content file relative to src/content/help/
   * e.g. "admin/analytics.md" or "shared/glossary.md"
   */
  file: string;
};
