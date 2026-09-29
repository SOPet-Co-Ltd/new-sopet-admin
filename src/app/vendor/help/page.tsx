import { redirect } from 'next/navigation';
import { helpBasePath } from '@/lib/help/registry';

/** Legacy in-app path → public official guidebook. */
export default function VendorHelpRedirectPage() {
  redirect(helpBasePath('vendor'));
}
