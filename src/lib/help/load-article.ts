import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { HELP_ARTICLES, getHelpArticle } from './registry';
import type { HelpRole } from './types';

const HELP_ROOT = path.join(process.cwd(), 'src/content/help');

export function resolveHelpFilePath(relativeFile: string): string {
  return path.join(HELP_ROOT, relativeFile);
}

export function loadHelpMarkdownByFile(relativeFile: string): string | null {
  const filePath = resolveHelpFilePath(relativeFile);
  if (!existsSync(filePath)) {
    return null;
  }
  return readFileSync(filePath, 'utf8');
}

export function loadHelpArticleMarkdown(role: HelpRole, slug: string): string | null {
  const meta = getHelpArticle(role, slug);
  if (!meta) {
    return null;
  }
  return loadHelpMarkdownByFile(meta.file);
}

export function listMissingHelpFiles(role?: HelpRole): string[] {
  const missing: string[] = [];
  for (const article of HELP_ARTICLES) {
    if (role && article.role !== role) continue;
    if (!existsSync(resolveHelpFilePath(article.file))) {
      missing.push(article.file);
    }
  }
  return missing;
}
