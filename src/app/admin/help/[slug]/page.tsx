import { redirect } from 'next/navigation';
import { helpArticleHref } from '@/lib/help/registry';

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Legacy in-app article → public official guidebook. */
export default async function AdminHelpSlugRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(helpArticleHref('admin', slug));
}
