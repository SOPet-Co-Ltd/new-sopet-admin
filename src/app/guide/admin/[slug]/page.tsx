import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HelpCenter } from '@/components/help/help-center';
import { getHelpArticle, getHelpArticles } from '@/lib/help/registry';
import { loadHelpArticleMarkdown } from '@/lib/help/load-article';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getHelpArticles('admin').map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getHelpArticle('admin', slug);
  if (!article) return { title: 'ไม่พบบทความ' };
  return {
    title: article.title,
    description: article.description,
  };
}

export default async function GuideAdminArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getHelpArticle('admin', slug);
  if (!article) notFound();

  const markdown = loadHelpArticleMarkdown('admin', slug);
  if (!markdown) notFound();

  return <HelpCenter role="admin" article={article} markdown={markdown} />;
}
