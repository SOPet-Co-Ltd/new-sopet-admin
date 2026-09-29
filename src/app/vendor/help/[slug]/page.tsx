import { redirect } from 'next/navigation';
import { helpArticleHref } from '@/lib/help/registry';

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Legacy in-app article → public official guidebook. */
export default async function VendorHelpSlugRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(helpArticleHref('vendor', slug));
}
