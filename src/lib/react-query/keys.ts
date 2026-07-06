import type { ProductsQueryParams } from '@/types';

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    currentUser: ['auth', 'currentUser'] as const,
  },
  stores: {
    all: ['stores'] as const,
    pending: () => ['stores', 'pending'] as const,
    list: () => ['stores', 'list'] as const,
    myStores: () => ['stores', 'myStores'] as const,
    myStore: () => ['stores', 'myStore'] as const,
    detail: (id: string) => ['stores', 'detail', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    vendor: () => ['orders', 'vendor'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params: ProductsQueryParams) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    publishChecklist: (id: string) => ['products', 'publishChecklist', id] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    store: (storeId: string) => ['analytics', 'store', storeId] as const,
    platform: (fromDate?: string, toDate?: string) =>
      ['analytics', 'platform', fromDate, toDate] as const,
    platformSalesOverTime: (fromDate?: string, toDate?: string) =>
      ['analytics', 'platformSalesOverTime', fromDate, toDate] as const,
    platformSalesByPayment: (fromDate?: string, toDate?: string) =>
      ['analytics', 'platformSalesByPayment', fromDate, toDate] as const,
    platformSalesByCategory: (fromDate?: string, toDate?: string, limit?: number) =>
      ['analytics', 'platformSalesByCategory', fromDate, toDate, limit] as const,
    platformTopProducts: (limit?: number) => ['analytics', 'platformTopProducts', limit] as const,
    platformTopStores: (limit?: number) => ['analytics', 'platformTopStores', limit] as const,
  },
  taxonomy: {
    all: ['taxonomy'] as const,
    approvedCategories: () => ['taxonomy', 'approvedCategories'] as const,
    approvedTags: () => ['taxonomy', 'approvedTags'] as const,
    pendingCategories: () => ['taxonomy', 'pendingCategories'] as const,
    pendingTags: () => ['taxonomy', 'pendingTags'] as const,
    myCategoryProposals: () => ['taxonomy', 'myCategoryProposals'] as const,
    myTagProposals: () => ['taxonomy', 'myTagProposals'] as const,
  },
  team: {
    all: ['team'] as const,
    members: () => ['team', 'members'] as const,
    invitations: () => ['team', 'invitations'] as const,
  },
  promotions: {
    all: ['promotions'] as const,
    store: (storeId: string) => ['promotions', 'store', storeId] as const,
    platform: () => ['promotions', 'platform'] as const,
  },
  storeRequests: {
    all: ['storeRequests'] as const,
    mine: () => ['storeRequests', 'mine'] as const,
    pending: () => ['storeRequests', 'pending'] as const,
  },
  storeReactivationRequests: {
    all: ['storeReactivationRequests'] as const,
    byStore: (storeId: string) => ['storeReactivationRequests', 'store', storeId] as const,
    admin: (status?: string) =>
      status
        ? (['storeReactivationRequests', 'admin', status] as const)
        : (['storeReactivationRequests', 'admin'] as const),
  },
  adminStores: {
    all: ['adminStores'] as const,
    list: () => ['adminStores', 'list'] as const,
    detail: (id: string) => ['adminStores', 'detail', id] as const,
  },
  adminVendors: {
    all: ['adminVendors'] as const,
    list: (search?: string) =>
      search ? (['adminVendors', 'list', search] as const) : (['adminVendors', 'list'] as const),
    detail: (id: string) => ['adminVendors', 'detail', id] as const,
  },
  shippingProviders: {
    all: ['shippingProviders'] as const,
    list: (includeInactive?: boolean) =>
      ['shippingProviders', 'list', includeInactive ?? false] as const,
  },
  storeShippingOptions: {
    all: ['storeShippingOptions'] as const,
    mine: () => ['storeShippingOptions', 'mine'] as const,
    admin: (storeId: string) => ['storeShippingOptions', 'admin', storeId] as const,
  },
  vendorInvitations: {
    all: ['vendorInvitations'] as const,
    pending: () => ['vendorInvitations', 'pending'] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    store: (storeId: string) => ['reviews', 'store', storeId] as const,
    summary: (storeId: string) => ['reviews', 'summary', storeId] as const,
  },
  topProducts: {
    store: (storeId: string, limit?: number) => ['topProducts', storeId, limit] as const,
  },
  platform: {
    all: ['platform'] as const,
    banners: () => ['platform', 'banners'] as const,
    sponsors: () => ['platform', 'sponsors'] as const,
    ads: () => ['platform', 'ads'] as const,
  },
  adminTeam: {
    all: ['adminTeam'] as const,
    members: () => ['adminTeam', 'members'] as const,
    invitations: () => ['adminTeam', 'invitations'] as const,
  },
  adminCustomers: {
    all: ['adminCustomers'] as const,
    list: (params: { page?: number; limit?: number; search?: string }) =>
      ['adminCustomers', 'list', params] as const,
    detail: (id: string) => ['adminCustomers', 'detail', id] as const,
  },
  vendorCustomers: {
    all: ['vendorCustomers'] as const,
    list: (params: { page?: number; limit?: number; search?: string }) =>
      ['vendorCustomers', 'list', params] as const,
    detail: (id: string) => ['vendorCustomers', 'detail', id] as const,
  },
  apiKeys: {
    all: ['apiKeys'] as const,
    store: (storeId: string) => ['apiKeys', 'store', storeId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (unreadOnly?: boolean) =>
      unreadOnly
        ? (['notifications', 'list', 'unread'] as const)
        : (['notifications', 'list'] as const),
    unreadCount: () => ['notifications', 'unreadCount'] as const,
  },
} as const;
