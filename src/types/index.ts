export type {
  ApiSuccess,
  ApiErrorEnvelope,
  ApiEnvelope,
  ApiMeta,
  Pagination,
  Paginated,
} from './api';

export type UserRole = 'admin' | 'vendor';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole | string;
  storeId?: string;
}

export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: StoreStatus | string;
}

export type OmiseRecipientStatus = 'not_connected' | 'pending' | 'active' | 'failed';

export interface StoreDetail extends Store {
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankCode?: string;
  omiseRecipientId?: string;
  omiseRecipientStatus?: OmiseRecipientStatus;
  omiseRecipientFailureMessage?: string;
}

export type TaxonomyStatus = 'pending' | 'approved' | 'rejected';

export interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  status: TaxonomyStatus | string;
  imageUrl?: string | null;
  proposedBy?: string;
  createdAt?: string;
}

export interface CategoryDeleteImpact {
  productCount: number;
  products: Array<{ id: string; name: string; slug: string }>;
}

export type TaxonomyDeleteImpact = CategoryDeleteImpact;

export interface TagDeleteImpact {
  productCount: number;
}

export interface DeleteCategoryResult {
  success: boolean;
  deletedId: string;
  detachedProductCount: number;
  notifiedStoreCount: number;
}

export interface DeleteTagResult {
  success: boolean;
  deletedId: string;
  detachedProductCount: number;
  notifiedStoreCount: number;
}

export interface DeletePetTypeResult {
  success: boolean;
  deletedId: string;
  detachedProductCount: number;
  notifiedStoreCount: number;
}

export interface DeleteBrandResult {
  success: boolean;
  deletedId: string;
  detachedProductCount: number;
  notifiedStoreCount: number;
}

export interface CreateCategoryInput {
  name: string;
  imageUrl?: string;
}

export interface CreatePetTypeInput {
  name: string;
  imageUrl?: string;
}

export interface SetPetTypeImageInput {
  petTypeId: string;
  imageUrl: string;
}

export interface SetCategoryImageInput {
  categoryId: string;
  imageUrl: string;
}

export interface UpdateCategoryInput {
  categoryId: string;
  name: string;
}

export interface UpdatePetTypeInput {
  petTypeId: string;
  name: string;
}

export interface DeleteCategoryInput {
  id: string;
}

export interface DeletePetTypeInput {
  id: string;
}

export interface DeleteBrandInput {
  id: string;
}

export type StoreMemberRole = 'owner' | 'manager' | 'staff';

export interface StoreMember {
  id: string;
  storeId: string;
  userId: string;
  role: StoreMemberRole | string;
  email?: string;
  fullName?: string;
}

export interface StoreMemberInvitation {
  id: string;
  storeId: string;
  email: string;
  role: StoreMemberRole | string;
  status: string;
  expiresAt: string;
}

export interface InviteStoreMemberInput {
  email: string;
  role: StoreMemberRole | string;
}

export interface UpdateStoreInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankCode?: string;
}

export interface UpdateVendorProfileInput {
  fullName?: string;
  email?: string;
}

export interface VendorStore {
  store: Store;
  membershipRole: string;
}

export interface OrderItem {
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
}

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  tumbon?: string | null;
  amphoe: string;
  province: string;
  postalCode: string;
}

export interface OrderStoreShipping {
  storeId: string;
  optionName: string;
  shippingFee: number;
}

export interface Order {
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
  shippingAddress?: OrderShippingAddress | null;
  storeShippings: OrderStoreShipping[];
  items: OrderItem[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: string;
}

export interface RejectStoreInput {
  storeId: string;
  rejectionReason?: string;
}

export type ProductStatus = 'draft' | 'published' | 'archived';

export interface ProductPublishChecklistItem {
  key: string;
  complete: boolean;
}

export interface ProductPublishChecklist {
  canPublish: boolean;
  items: ProductPublishChecklistItem[];
  missingKeys: string[];
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
  isThumbnail?: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stockQuantity: number;
  optionsJson?: string | null;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  warning?: string;
  expiryDate?: string;
  thumbnailUrl?: string;
  status: ProductStatus | string;
  category?: string;
  categoryId?: string;
  petTypeId?: string;
  brandId?: string;
  tags: string[];
  tagIds?: string[];
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductsQueryParams {
  search?: string;
  storeId?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResult {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductInput {
  name: string;
  description?: string;
  basePrice: number;
  category?: string;
  categoryId?: string;
  tags?: string[];
  tagIds?: string[];
  petTypeId?: string;
  brandId?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  basePrice?: number;
  warning?: string;
  expiryDate?: string;
  status?: ProductStatus | string;
  category?: string;
  categoryId?: string;
  tags?: string[];
  tagIds?: string[];
  petTypeId?: string;
  brandId?: string;
}

export interface AddProductImageInput {
  url: string;
  sortOrder?: number;
  altText?: string;
}

export interface UpdateProductImageInput {
  sortOrder?: number;
  altText?: string;
}

export interface SyncVariantInput {
  id?: string;
  sku: string;
  stockQuantity: number;
  priceModifier?: number;
  attributes: Record<string, string>;
}

export interface StoreAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  recentOrders: number;
}

export interface PlatformAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalStores: number;
  pendingStores: number;
  totalCustomers: number;
  openDisputes: number;
}

export interface SalesTimePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface SalesBreakdownItem {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface TopStore {
  storeId: string;
  storeName: string;
  revenue: number;
  orderCount: number;
}

export type PromotionType =
  | 'percentage'
  | 'fixed_amount'
  | 'free_shipping'
  | 'buy_x_get_y'
  | 'fixed_shipping_discount'
  | 'percentage_shipping_discount';

export type PromotionScope = 'platform' | 'store';

export interface Promotion {
  id: string;
  storeId?: string;
  code: string;
  name: string;
  description?: string;
  type: PromotionType | string;
  scope: PromotionScope | string;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usagePerCustomer: number;
  usageCount: number;
  isActive: boolean;
  autoApply: boolean;
  priority: number;
  conditions?: string;
  startsAt?: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface CreatePromotionInput {
  code: string;
  name: string;
  description?: string;
  type: PromotionType | string;
  scope?: PromotionScope | string;
  storeId?: string;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usagePerCustomer?: number;
  autoApply?: boolean;
  priority?: number;
  conditions?: string;
  startsAt?: string;
  expiresAt?: string;
}

export interface UpdatePromotionInput {
  code?: string;
  name?: string;
  description?: string;
  type?: PromotionType | string;
  discountValue?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usagePerCustomer?: number;
  autoApply?: boolean;
  priority?: number;
  conditions?: string;
  startsAt?: string;
  expiresAt?: string;
}

export type StoreRequestStatus = 'pending' | 'approved' | 'rejected';

export interface StoreRequest {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  status: StoreRequestStatus | string;
  rejectionReason?: string;
  createdAt?: string;
}

export interface SubmitStoreRequestInput {
  storeName: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
}

export type StoreReactivationRequestStatus = 'pending' | 'approved' | 'rejected';

export interface StoreReactivationRequestImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface StoreReactivationRequest {
  id: string;
  storeId: string;
  storeName: string;
  submittedByUserId: string;
  submittedByFullName?: string;
  submittedByEmail?: string;
  title: string;
  content: string;
  status: StoreReactivationRequestStatus | string;
  reviewNote?: string;
  images: StoreReactivationRequestImage[];
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
}

export interface SubmitStoreReactivationRequestInput {
  storeId: string;
  title: string;
  content: string;
  mediaUrls?: string[];
}

export interface RegisterVendorInput {
  email: string;
  password: string;
  fullName: string;
}

export interface AdminStore extends StoreDetail {
  ownerId?: string;
  ownerEmail?: string;
  ownerFullName?: string;
  createdAt?: string;
}

export interface CreateStoreAsAdminInput {
  name: string;
  slug?: string;
  description?: string;
  ownerId?: string;
  ownerEmail?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
}

export interface UpdateStoreAsAdminInput {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status?: StoreStatus | string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  ownerId?: string;
  ownerEmail?: string;
}

export interface AdminVendor {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  storeCount?: number;
}

export interface UpdateVendorAsAdminInput {
  fullName?: string;
  email?: string;
  isActive?: boolean;
}

export interface AdminCustomer {
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
}

export interface UpdateCustomerAsAdminInput {
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface VendorCustomer {
  id: string;
  phone: string;
  fullName?: string | null;
  email?: string | null;
  isVerified: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface CustomersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface VendorInvitation {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  token?: string;
  createdAt?: string;
}

export interface InviteVendorInput {
  email: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName?: string;
  rating: number;
  comment?: string;
  status: string;
  createdAt?: string;
  customerName?: string;
}

export interface StoreReviewSummary {
  averageRating: number;
  reviewCount: number;
  rating5Count: number;
  rating4Count: number;
  rating3Count: number;
  rating2Count: number;
  rating1Count: number;
  productBreakdown?: Array<{
    productId: string;
    productName: string;
    averageRating: number;
    reviewCount: number;
  }>;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface ShippingProvider {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreShippingOption {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  sortOrder?: number;
  isActive: boolean;
  providerId?: string;
}

export interface CreateShippingProviderInput {
  name: string;
}

export interface UpdateShippingProviderInput {
  name?: string;
  isActive?: boolean;
}

export interface CreateShippingOptionInput {
  name: string;
  description?: string;
  price: number;
  sortOrder?: number;
  isActive?: boolean;
  providerId?: string;
}

export interface UpdateShippingOptionInput {
  name?: string;
  description?: string;
  price?: number;
  sortOrder?: number;
  isActive?: boolean;
  providerId?: string;
}

export interface PlatformBanner {
  id: string;
  title: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface CreatePlatformBannerInput {
  title: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePlatformBannerInput {
  id: string;
  title?: string;
  imageUrl?: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface PlatformSponsor {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface CreatePlatformSponsorInput {
  name: string;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePlatformSponsorInput {
  id: string;
  name?: string;
  imageUrl?: string;
  linkUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface PlatformAd {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface CreatePlatformAdInput {
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  isActive?: boolean;
}

export interface UpdatePlatformAdInput {
  id: string;
  title?: string;
  imageUrl?: string;
  linkUrl?: string | null;
  isActive?: boolean;
}

export interface AdminTeamMember {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
}

export interface InviteAdminInput {
  email: string;
}
