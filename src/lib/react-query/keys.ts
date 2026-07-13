import type { ProductsQueryParams, StoreProductReviewsParams } from '@/types';

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
    vendorRoot: () => ['orders', 'vendor'] as const,
    vendor: (storeId: string) => ['orders', 'vendor', storeId] as const,
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
    approvedPetTypes: () => ['taxonomy', 'approvedPetTypes'] as const,
    approvedBrands: () => ['taxonomy', 'approvedBrands'] as const,
    pendingCategories: () => ['taxonomy', 'pendingCategories'] as const,
    pendingTags: () => ['taxonomy', 'pendingTags'] as const,
    pendingPetTypes: () => ['taxonomy', 'pendingPetTypes'] as const,
    pendingBrands: () => ['taxonomy', 'pendingBrands'] as const,
    myCategoryProposals: () => ['taxonomy', 'myCategoryProposals'] as const,
    myTagProposals: () => ['taxonomy', 'myTagProposals'] as const,
    rejectedCategories: () => ['taxonomy', 'rejectedCategories'] as const,
    rejectedTags: () => ['taxonomy', 'rejectedTags'] as const,
    categoryDeleteImpact: (categoryId: string) =>
      ['taxonomy', 'categoryDeleteImpact', categoryId] as const,
    tagDeleteImpact: (tagId: string) => ['taxonomy', 'tagDeleteImpact', tagId] as const,
    petTypeDeleteImpact: (petTypeId: string) =>
      ['taxonomy', 'petTypeDeleteImpact', petTypeId] as const,
    brandDeleteImpact: (brandId: string) => ['taxonomy', 'brandDeleteImpact', brandId] as const,
  },
  team: {
    all: ['team'] as const,
    members: () => ['team', 'members'] as const,
    invitations: () => ['team', 'invitations'] as const,
    invitationPreview: (token: string) => ['team', 'invitationPreview', token] as const,
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
    detailInsights: (id: string) => ['adminVendors', 'detailInsights', id] as const,
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
    store: (storeId: string, params?: StoreProductReviewsParams) =>
      ['reviews', 'store', storeId, params] as const,
    summary: (storeId: string) => ['reviews', 'summary', storeId] as const,
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
    detailInsights: (id: string) => ['adminCustomers', 'detailInsights', id] as const,
  },
  adminAuditLogs: {
    all: ['adminAuditLogs'] as const,
    list: (params: Record<string, unknown>) => ['adminAuditLogs', 'list', params] as const,
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
  search: {
    all: ['search'] as const,
    rankingWeights: () => ['search', 'rankingWeights'] as const,
    synonyms: () => ['search', 'synonyms'] as const,
    analyticsSummary: (fromDate?: string, toDate?: string) =>
      ['search', 'analyticsSummary', fromDate, toDate] as const,
    analyticsTopQueries: (fromDate?: string, toDate?: string, limit?: number) =>
      ['search', 'analyticsTopQueries', fromDate, toDate, limit] as const,
    analyticsZeroResultQueries: (fromDate?: string, toDate?: string, limit?: number) =>
      ['search', 'analyticsZeroResultQueries', fromDate, toDate, limit] as const,
    analyticsSuggestionCtr: (fromDate?: string, toDate?: string) =>
      ['search', 'analyticsSuggestionCtr', fromDate, toDate] as const,
  },
  payouts: {
    all: ['payouts'] as const,
    vendorSummary: () => ['payouts', 'vendorSummary'] as const,
    vendorHistory: () => ['payouts', 'vendorHistory'] as const,
    adminSummary: (storeId: string) => ['payouts', 'adminSummary', storeId] as const,
    adminHistory: (storeId: string) => ['payouts', 'adminHistory', storeId] as const,
  },
} as const;
