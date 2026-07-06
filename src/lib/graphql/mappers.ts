import type {
  AdminStore,
  AdminVendor,
  Order,
  PlatformAnalytics,
  Product,
  ProductReview,
  Promotion,
  SalesBreakdownItem,
  SalesTimePoint,
  Store,
  StoreAnalytics,
  StoreRequest,
  StoreReviewSummary,
  TopProduct,
  TopStore,
  User,
  VendorInvitation,
} from '@/types';

type GqlUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

type GqlStore = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  status: string;
};

type GqlOrderItem = {
  id: string;
  storeId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  fulfillmentStatus: string;
};

type GqlOrder = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  guestPhone?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  items: GqlOrderItem[];
};

export function mapUser(user: GqlUser, storeId?: string): User {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    storeId,
  };
}

export function mapStore(store: GqlStore): Store {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description ?? undefined,
    logoUrl: store.logoUrl ?? undefined,
    bannerUrl: store.bannerUrl ?? undefined,
    status: store.status,
  };
}

export function mapOrder(order: GqlOrder): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    discountAmount: order.discountAmount,
    total: order.total,
    paymentMethod: order.paymentMethod,
    guestPhone: order.guestPhone ?? undefined,
    guestName: order.guestName ?? undefined,
    guestEmail: order.guestEmail ?? undefined,
    items: order.items.map((item) => ({
      id: item.id,
      storeId: item.storeId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
      fulfillmentStatus: item.fulfillmentStatus,
    })),
  };
}

type GqlProductImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
  isThumbnail?: boolean | null;
};

type GqlProductVariant = {
  id: string;
  sku: string;
  price: number;
  stockQuantity: number;
  optionsJson?: string | null;
};

type GqlProduct = {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  warning?: string | null;
  expiryDate?: string | null;
  thumbnailUrl?: string | null;
  status: string;
  category?: string | null;
  categoryId?: string | null;
  tags: string[];
  tagIds?: string[] | null;
  images?: GqlProductImage[] | null;
  variants?: GqlProductVariant[] | null;
};

type GqlPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type GqlStoreAnalytics = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  recentOrders: number;
};

export function mapProduct(product: GqlProduct): Product {
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    slug: product.slug,
    description: product.description ?? undefined,
    basePrice: product.basePrice,
    warning: product.warning ?? undefined,
    expiryDate: product.expiryDate ?? undefined,
    thumbnailUrl: product.thumbnailUrl ?? undefined,
    status: product.status,
    category: product.category ?? undefined,
    categoryId: product.categoryId ?? undefined,
    tags: product.tags ?? [],
    tagIds: product.tagIds ?? undefined,
    images: product.images?.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      sortOrder: image.sortOrder,
      isThumbnail: image.isThumbnail ?? undefined,
    })),
    variants: product.variants?.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: variant.price,
      stockQuantity: variant.stockQuantity,
      optionsJson: variant.optionsJson,
    })),
  };
}

export function mapPagination(pagination: GqlPagination) {
  return {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

export function mapStoreAnalytics(analytics: GqlStoreAnalytics): StoreAnalytics {
  return {
    totalOrders: analytics.totalOrders,
    totalRevenue: analytics.totalRevenue,
    totalProducts: analytics.totalProducts,
    pendingOrders: analytics.pendingOrders,
    recentOrders: analytics.recentOrders,
  };
}

type GqlPlatformAnalytics = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalStores: number;
  pendingStores: number;
  totalCustomers: number;
  openDisputes: number;
};

export function mapPlatformAnalytics(analytics: GqlPlatformAnalytics): PlatformAnalytics {
  return {
    totalOrders: analytics.totalOrders,
    totalRevenue: analytics.totalRevenue,
    averageOrderValue: analytics.averageOrderValue,
    totalStores: analytics.totalStores,
    pendingStores: analytics.pendingStores,
    totalCustomers: analytics.totalCustomers,
    openDisputes: analytics.openDisputes,
  };
}

type GqlSalesTimePoint = {
  date: string;
  revenue: number;
  orderCount: number;
};

export function mapSalesTimePoint(point: GqlSalesTimePoint): SalesTimePoint {
  return {
    date: point.date,
    revenue: point.revenue,
    orderCount: point.orderCount,
  };
}

type GqlSalesBreakdownItem = {
  label: string;
  revenue: number;
  orderCount: number;
};

export function mapSalesBreakdownItem(item: GqlSalesBreakdownItem): SalesBreakdownItem {
  return {
    label: item.label,
    revenue: item.revenue,
    orderCount: item.orderCount,
  };
}

type GqlTopStore = {
  storeId: string;
  storeName: string;
  revenue: number;
  orderCount: number;
};

export function mapTopStore(store: GqlTopStore): TopStore {
  return {
    storeId: store.storeId,
    storeName: store.storeName,
    revenue: store.revenue,
    orderCount: store.orderCount,
  };
}

type GqlPromotion = {
  id: string;
  storeId?: string | null;
  code: string;
  name: string;
  description?: string | null;
  type: string;
  scope: string;
  discountValue: number;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usagePerCustomer: number;
  usageCount: number;
  isActive: boolean;
  autoApply: boolean;
  priority: number;
  conditions?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
};

export function mapPromotion(promotion: GqlPromotion): Promotion {
  return {
    id: promotion.id,
    storeId: promotion.storeId ?? undefined,
    code: promotion.code,
    name: promotion.name,
    description: promotion.description ?? undefined,
    type: promotion.type,
    scope: promotion.scope,
    discountValue: promotion.discountValue,
    minPurchaseAmount: promotion.minPurchaseAmount ?? undefined,
    maxDiscountAmount: promotion.maxDiscountAmount ?? undefined,
    usageLimit: promotion.usageLimit ?? undefined,
    usagePerCustomer: promotion.usagePerCustomer,
    usageCount: promotion.usageCount,
    isActive: promotion.isActive,
    autoApply: promotion.autoApply,
    priority: promotion.priority,
    conditions: promotion.conditions ?? undefined,
    startsAt: promotion.startsAt ?? undefined,
    expiresAt: promotion.expiresAt ?? undefined,
    createdAt: promotion.createdAt ?? undefined,
  };
}

type GqlStoreRequest = {
  id: string;
  storeName: string;
  description?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  status: string;
  rejectionReason?: string | null;
  createdAt?: string | null;
};

export function mapStoreRequest(request: GqlStoreRequest): StoreRequest {
  return {
    id: request.id,
    name: request.storeName,
    description: request.description ?? undefined,
    contactPhone: request.contactPhone ?? undefined,
    contactEmail: request.contactEmail ?? undefined,
    address: request.address ?? undefined,
    status: request.status,
    rejectionReason: request.rejectionReason ?? undefined,
    createdAt: request.createdAt ?? undefined,
  };
}

type GqlStoreReactivationRequest = {
  id: string;
  storeId: string;
  storeName: string;
  submittedByUserId: string;
  submittedByFullName?: string | null;
  submittedByEmail?: string | null;
  title: string;
  content: string;
  status: string;
  reviewNote?: string | null;
  images?: Array<{ id: string; imageUrl: string; sortOrder: number }>;
  createdAt?: string | null;
  updatedAt?: string | null;
  reviewedAt?: string | null;
};

export function mapStoreReactivationRequest(
  request: GqlStoreReactivationRequest,
): import('@/types').StoreReactivationRequest {
  return {
    id: request.id,
    storeId: request.storeId,
    storeName: request.storeName,
    submittedByUserId: request.submittedByUserId,
    submittedByFullName: request.submittedByFullName ?? undefined,
    submittedByEmail: request.submittedByEmail ?? undefined,
    title: request.title,
    content: request.content,
    status: request.status,
    reviewNote: request.reviewNote ?? undefined,
    images: (request.images ?? []).map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      sortOrder: image.sortOrder,
    })),
    createdAt: request.createdAt ?? undefined,
    updatedAt: request.updatedAt ?? undefined,
    reviewedAt: request.reviewedAt ?? undefined,
  };
}

type GqlAdminStore = GqlStore & {
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  ownerId?: string | null;
  ownerEmail?: string | null;
  ownerFullName?: string | null;
  createdAt?: string | null;
};

export function mapAdminStore(store: GqlAdminStore): AdminStore {
  return {
    ...mapStore(store),
    contactPhone: store.contactPhone ?? undefined,
    contactEmail: store.contactEmail ?? undefined,
    address: store.address ?? undefined,
    ownerId: store.ownerId ?? undefined,
    ownerEmail: store.ownerEmail ?? undefined,
    ownerFullName: store.ownerFullName ?? undefined,
    createdAt: store.createdAt ?? undefined,
  };
}

type GqlAdminVendor = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  stores?: Array<{ id: string; name: string; slug: string; status: string }>;
};

export function mapAdminVendor(vendor: GqlAdminVendor): AdminVendor {
  return {
    id: vendor.id,
    email: vendor.email,
    fullName: vendor.fullName,
    role: vendor.role,
    isActive: vendor.isActive,
    lastLoginAt: vendor.lastLoginAt ?? undefined,
    createdAt: vendor.createdAt ?? undefined,
    storeCount: vendor.stores?.length,
  };
}

type GqlVendorInvitation = {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  token?: string;
};

export function mapVendorInvitation(invitation: GqlVendorInvitation): VendorInvitation {
  return {
    id: invitation.id,
    email: invitation.email,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    token: invitation.token,
  };
}

type GqlProductReview = {
  id: string;
  productId: string;
  productName?: string | null;
  rating: number;
  comment?: string | null;
  status: string;
  createdAt?: string | null;
  customerName?: string | null;
};

export function mapProductReview(review: GqlProductReview): ProductReview {
  return {
    id: review.id,
    productId: review.productId,
    productName: review.productName ?? undefined,
    rating: review.rating,
    comment: review.comment ?? undefined,
    status: review.status,
    createdAt: review.createdAt ?? undefined,
    customerName: review.customerName ?? undefined,
  };
}

type GqlStoreReviewSummary = {
  averageRating: number;
  totalCount: number;
  productBreakdown: Array<{
    productId: string;
    productName: string;
    averageRating: number;
    reviewCount: number;
  }>;
};

export function mapStoreReviewSummary(summary: GqlStoreReviewSummary): StoreReviewSummary {
  return {
    averageRating: summary.averageRating,
    reviewCount: summary.totalCount,
    rating5Count: 0,
    rating4Count: 0,
    rating3Count: 0,
    rating2Count: 0,
    rating1Count: 0,
    productBreakdown: summary.productBreakdown,
  };
}

type GqlTopProduct = {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
};

export function mapTopProduct(product: GqlTopProduct): TopProduct {
  return {
    productId: product.productId,
    productName: product.name,
    totalSold: product.unitsSold,
    revenue: product.revenue,
  };
}

type GqlAdminCustomer = {
  id: string;
  phone: string;
  fullName?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export function mapAdminCustomer(customer: GqlAdminCustomer): import('@/types').AdminCustomer {
  return {
    id: customer.id,
    phone: customer.phone,
    fullName: customer.fullName,
    email: customer.email,
    dateOfBirth: customer.dateOfBirth,
    isVerified: customer.isVerified,
    isActive: customer.isActive,
    lastLoginAt: customer.lastLoginAt ?? undefined,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

type GqlVendorCustomer = {
  id: string;
  phone: string;
  fullName?: string | null;
  email?: string | null;
  isVerified: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
};

export function mapVendorCustomer(customer: GqlVendorCustomer): import('@/types').VendorCustomer {
  return {
    id: customer.id,
    phone: customer.phone,
    fullName: customer.fullName,
    email: customer.email,
    isVerified: customer.isVerified,
    lastLoginAt: customer.lastLoginAt ?? undefined,
    createdAt: customer.createdAt,
  };
}
