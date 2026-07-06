import { redirect } from 'next/navigation';

/** Legacy route — redirects to stores hub. */
export default function VendorRequestsPage() {
  redirect('/vendor/stores');
}
