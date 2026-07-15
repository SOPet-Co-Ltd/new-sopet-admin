import { getApiBaseUrl } from '@/lib/config';

import VendorApiDocsPage from './vendor-api-docs-page';

export default function Page() {
  return <VendorApiDocsPage apiBaseUrl={getApiBaseUrl()} />;
}
