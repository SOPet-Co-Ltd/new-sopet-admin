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
  profilePhotoUrl?: string | null;
  emailVerified?: boolean;
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
  trackingNumber?: string | null;
  fulfillmentProvider?: string | null;
  trackingUrl?: string | null;
};

type GqlOrderShippingAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  tumbon?: string | null;
  amphoe: string;
  province: string;
  postalCode: string;
};

type GqlOrderStoreShipping = {
  storeId: string;
  optionName: string;
  shippingFee: number;
};

type GqlOrder = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  guestPhone?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  shippingAddress?: GqlOrderShippingAddress | null;
  storeShippings?: GqlOrderStoreShipping[];
  items: GqlOrderItem[];
};

export function mapUser(user: GqlUser, storeId?: string): User {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    storeId,
    profilePhotoUrl: user.profilePhotoUrl ?? null,
    emailVerified: user.emailVerified ?? false,
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
    createdAt: order.createdAt,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    discountAmount: order.discountAmount,
    total: order.total,
    paymentMethod: order.paymentMethod,
    guestPhone: order.guestPhone ?? undefined,
    guestName: order.guestName ?? undefined,
    guestEmail: order.guestEmail ?? undefined,
    shippingAddress: order.shippingAddress
      ? {
          fullName: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          addressLine1: order.shippingAddress.addressLine1,
          addressLine2: order.shippingAddress.addressLine2 ?? undefined,
          tumbon: order.shippingAddress.tumbon ?? undefined,
          amphoe: order.shippingAddress.amphoe,
          province: order.shippingAddress.province,
          postalCode: order.shippingAddress.postalCode,
        }
      : undefined,
    storeShippings:
      order.storeShippings?.map((shipping) => ({
        storeId: shipping.storeId,
        optionName: shipping.optionName,
        shippingFee: shipping.shippingFee,
      })) ?? [],
    items: order.items.map((item) => ({
      id: item.id,
      storeId: item.storeId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
      fulfillmentStatus: item.fulfillmentStatus,
      trackingNumber: item.trackingNumber ?? undefined,
      fulfillmentProvider: item.fulfillmentProvider ?? undefined,
      trackingUrl: item.trackingUrl ?? undefined,
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
  petTypeId?: string | null;
  brandId?: string | null;
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
    petTypeId: product.petTypeId ?? undefined,
    brandId: product.brandId ?? undefined,
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
};

export function mapPlatformAnalytics(analytics: GqlPlatformAnalytics): PlatformAnalytics {
  return {
    totalOrders: analytics.totalOrders,
    totalRevenue: analytics.totalRevenue,
    averageOrderValue: analytics.averageOrderValue,
    totalStores: analytics.totalStores,
    pendingStores: analytics.pendingStores,
    totalCustomers: analytics.totalCustomers,
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
    stores: vendor.stores?.map((store) => ({
      id: store.id,
      name: store.name,
      slug: store.slug,
      status: store.status,
    })),
  };
}

type GqlAdminVendorActivity = {
  kind: string;
  occurredAt: string;
  storeId?: string | null;
  storeName?: string | null;
  orderNumber?: string | null;
};

type GqlAdminVendorMembership = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeStatus: string;
  role: string;
  joinedAt: string;
};

type GqlAdminVendorInsights = {
  storeCount: number;
  membershipCount: number;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderAt?: string | null;
  lastActivityAt?: string | null;
  memberships: GqlAdminVendorMembership[];
  activities: GqlAdminVendorActivity[];
  recentOrders: GqlAdminCustomerRecentOrder[];
};

type GqlAdminVendorDetail = GqlAdminVendor & {
  emailVerified: boolean;
  insights: GqlAdminVendorInsights;
};

export function mapAdminVendorDetail(
  vendor: GqlAdminVendorDetail,
): import('@/types').AdminVendorDetail {
  const mapped = mapAdminVendor(vendor);
  return {
    ...mapped,
    emailVerified: vendor.emailVerified,
    stores: mapped.stores ?? [],
    insights: {
      storeCount: vendor.insights.storeCount,
      membershipCount: vendor.insights.membershipCount,
      totalRevenue: vendor.insights.totalRevenue,
      orderCount: vendor.insights.orderCount,
      averageOrderValue: vendor.insights.averageOrderValue,
      lastOrderAt: vendor.insights.lastOrderAt ?? undefined,
      lastActivityAt: vendor.insights.lastActivityAt ?? undefined,
      memberships: vendor.insights.memberships.map((membership) => ({
        storeId: membership.storeId,
        storeName: membership.storeName,
        storeSlug: membership.storeSlug,
        storeStatus: membership.storeStatus,
        role: membership.role,
        joinedAt: membership.joinedAt,
      })),
      activities: vendor.insights.activities.map((activity) => ({
        kind: activity.kind,
        occurredAt: activity.occurredAt,
        storeId: activity.storeId ?? undefined,
        storeName: activity.storeName ?? undefined,
        orderNumber: activity.orderNumber ?? undefined,
      })),
      recentOrders: vendor.insights.recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      })),
    },
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

type GqlReviewReply = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type GqlReviewImage = {
  id: string;
  url: string;
};

type GqlProductReview = {
  id: string;
  productId: string;
  productName?: string | null;
  productSlug?: string | null;
  productImageUrl?: string | null;
  rating: number;
  comment?: string | null;
  status: string;
  createdAt?: string | null;
  customerName?: string | null;
  images?: GqlReviewImage[] | null;
  reply?: GqlReviewReply | null;
};

function mapReviewReply(reply: GqlReviewReply): import('@/types').ReviewReply {
  return {
    id: reply.id,
    body: reply.body,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
  };
}

export function mapProductReview(review: GqlProductReview): ProductReview {
  return {
    id: review.id,
    productId: review.productId,
    productName: review.productName ?? undefined,
    productSlug: review.productSlug ?? undefined,
    productImageUrl: review.productImageUrl ?? undefined,
    rating: review.rating,
    comment: review.comment ?? undefined,
    status: review.status,
    createdAt: review.createdAt ?? undefined,
    customerName: review.customerName ?? undefined,
    images: (review.images ?? []).map((image) => ({ id: image.id, url: image.url })),
    reply: review.reply ? mapReviewReply(review.reply) : null,
  };
}

export function mapReviewReplyType(reply: GqlReviewReply): import('@/types').ReviewReply {
  return mapReviewReply(reply);
}

type GqlStoreReviewSummary = {
  averageRating: number;
  totalCount: number;
  rating5Count: number;
  rating4Count: number;
  rating3Count: number;
  rating2Count: number;
  rating1Count: number;
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
    rating5Count: summary.rating5Count,
    rating4Count: summary.rating4Count,
    rating3Count: summary.rating3Count,
    rating2Count: summary.rating2Count,
    rating1Count: summary.rating1Count,
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

type GqlAdminCustomerOrderItemSummary = {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type GqlAdminCustomerRecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: GqlAdminCustomerOrderItemSummary[];
};

type GqlAdminCustomerInsights = {
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderAt?: string | null;
  addressCount: number;
  favoriteCount: number;
  recentOrders: GqlAdminCustomerRecentOrder[];
};

type GqlAdminCustomerDetail = GqlAdminCustomer & {
  insights: GqlAdminCustomerInsights;
};

export function mapAdminCustomerDetail(
  customer: GqlAdminCustomerDetail,
): import('@/types').AdminCustomerDetail {
  return {
    ...mapAdminCustomer(customer),
    insights: {
      totalSpent: customer.insights.totalSpent,
      orderCount: customer.insights.orderCount,
      averageOrderValue: customer.insights.averageOrderValue,
      lastOrderAt: customer.insights.lastOrderAt ?? undefined,
      addressCount: customer.insights.addressCount,
      favoriteCount: customer.insights.favoriteCount,
      recentOrders: customer.insights.recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      })),
    },
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

type GqlVendorCustomerStoreInsights = {
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderAt?: string | null;
  favoriteCount: number;
  reviewCount: number;
  recentOrders: GqlAdminCustomerRecentOrder[];
  recentReviews: Array<{
    id: string;
    productName: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
  }>;
  favoriteProducts: Array<{
    productName: string;
    createdAt: string;
  }>;
};

type GqlVendorCustomerDetail = GqlVendorCustomer & {
  insights: GqlVendorCustomerStoreInsights;
};

export function mapVendorCustomerDetail(
  customer: GqlVendorCustomerDetail,
): import('@/types').VendorCustomerDetail {
  return {
    ...mapVendorCustomer(customer),
    insights: {
      totalSpent: customer.insights.totalSpent,
      orderCount: customer.insights.orderCount,
      averageOrderValue: customer.insights.averageOrderValue,
      lastOrderAt: customer.insights.lastOrderAt ?? undefined,
      favoriteCount: customer.insights.favoriteCount,
      reviewCount: customer.insights.reviewCount,
      recentOrders: customer.insights.recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      })),
      recentReviews: customer.insights.recentReviews.map((review) => ({
        id: review.id,
        productName: review.productName,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      favoriteProducts: customer.insights.favoriteProducts.map((favorite) => ({
        productName: favorite.productName,
        createdAt: favorite.createdAt,
      })),
    },
  };
}
