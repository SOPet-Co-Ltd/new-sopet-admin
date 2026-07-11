/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string };
};

export type AcceptVendorInvitationInput = {
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type AddPaymentMethodInput = {
  brand: Scalars['String']['input'];
  expiryMonth: Scalars['Int']['input'];
  expiryYear: Scalars['Int']['input'];
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  lastFour: Scalars['String']['input'];
  omiseCardToken: Scalars['String']['input'];
};

export type AddProductImageInput = {
  altText?: InputMaybe<Scalars['String']['input']>;
  isThumbnail?: InputMaybe<Scalars['Boolean']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  url: Scalars['String']['input'];
};

export type AddToCartInput = {
  quantity: Scalars['Int']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
  variantId: Scalars['String']['input'];
};

export type AdminCustomerConnection = {
  __typename?: 'AdminCustomerConnection';
  items: Array<AdminCustomerType>;
  pagination: PaginationMeta;
};

export type AdminCustomerType = {
  __typename?: 'AdminCustomerType';
  createdAt: Scalars['DateTime']['output'];
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  phone: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminInvitationType = {
  __typename?: 'AdminInvitationType';
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type AdminStoreType = {
  __typename?: 'AdminStoreType';
  address?: Maybe<Scalars['String']['output']>;
  bankAccountName?: Maybe<Scalars['String']['output']>;
  bankAccountNumber?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  bannerUrl?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  ownerEmail?: Maybe<Scalars['String']['output']>;
  ownerFullName?: Maybe<Scalars['String']['output']>;
  ownerId: Scalars['String']['output'];
  payoutSchedule: Scalars['String']['output'];
  payoutSchedulePaused: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminTeamMemberType = {
  __typename?: 'AdminTeamMemberType';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
};

export type AdminVendorStoreType = {
  __typename?: 'AdminVendorStoreType';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type AdminVendorType = {
  __typename?: 'AdminVendorType';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  role: Scalars['String']['output'];
  stores: Array<AdminVendorStoreType>;
};

export type ApproveStoreInput = {
  storeId: Scalars['String']['input'];
};

export type AuthTokens = {
  __typename?: 'AuthTokens';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type BrandType = {
  __typename?: 'BrandType';
  approvalStatus: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CartItemType = {
  __typename?: 'CartItemType';
  id: Scalars['String']['output'];
  productVariant?: Maybe<ProductVariantType>;
  quantity: Scalars['Int']['output'];
  variantId: Scalars['String']['output'];
};

export type CartType = {
  __typename?: 'CartType';
  customerId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  items: Array<CartItemType>;
  sessionId?: Maybe<Scalars['String']['output']>;
};

export type CategoryType = {
  __typename?: 'CategoryType';
  approvalStatus: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ChangeCustomerPhoneInput = {
  code: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type ConfirmOrderDeliveredInput = {
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
};

export type CreateAddressInput = {
  addressLine1: Scalars['String']['input'];
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  amphoe: Scalars['String']['input'];
  city?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  postalCode: Scalars['String']['input'];
  province: Scalars['String']['input'];
  recipientName: Scalars['String']['input'];
  recipientPhone: Scalars['String']['input'];
  tumbon?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBrandInput = {
  name: Scalars['String']['input'];
};

export type CreateCategoryInput = {
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateOrderInput = {
  cartItemIds?: InputMaybe<Array<Scalars['String']['input']>>;
  guestEmail?: InputMaybe<Scalars['String']['input']>;
  guestName?: InputMaybe<Scalars['String']['input']>;
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  items: Array<OrderItemInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentMethod: Scalars['String']['input'];
  platformPromotionCode?: InputMaybe<Scalars['String']['input']>;
  promotionCode?: InputMaybe<Scalars['String']['input']>;
  savedAddressId?: InputMaybe<Scalars['String']['input']>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  shippingAddress?: InputMaybe<ShippingAddressInput>;
  storePromotionCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  storeShipping?: InputMaybe<Array<StoreShippingSelectionInput>>;
};

export type CreatePaymentInput = {
  amount: Scalars['Float']['input'];
  currency?: Scalars['String']['input'];
  omiseToken?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
  paymentMethod: Scalars['String']['input'];
  savedPaymentMethodId?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePayoutInput = {
  amount: Scalars['Float']['input'];
  storeId: Scalars['String']['input'];
};

export type CreatePetTypeInput = {
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreatePlatformAdInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  imageUrl: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePlatformBannerInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  imageUrl: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  mobileImageUrl?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePlatformSponsorInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  imageUrl: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CreateProductInput = {
  basePrice: Scalars['Float']['input'];
  brandId?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  compareAtPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  petTypeId?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  warning?: InputMaybe<Scalars['String']['input']>;
};

export type CreateProductVariantInput = {
  /** JSON object of variant attributes (e.g. {"size":"M","color":"Red"}) */
  attributes?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  priceModifier?: InputMaybe<Scalars['Float']['input']>;
  sku: Scalars['String']['input'];
  stockQuantity: Scalars['Int']['input'];
};

export type CreatePromotionInput = {
  autoApply?: InputMaybe<Scalars['Boolean']['input']>;
  code: Scalars['String']['input'];
  conditions?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  discountValue: Scalars['Float']['input'];
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxDiscountAmount?: InputMaybe<Scalars['Float']['input']>;
  minPurchaseAmount?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
  usageLimit?: InputMaybe<Scalars['Int']['input']>;
  usagePerCustomer?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateReviewInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  orderId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
  rating: Scalars['Int']['input'];
};

export type CreateReviewReplyInput = {
  body: Scalars['String']['input'];
  reviewId: Scalars['String']['input'];
};

export type CreateSearchSynonymInput = {
  expansion: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  terms: Array<Scalars['String']['input']>;
};

export type CreateShippingOptionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  providerId?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateShippingProviderInput = {
  name: Scalars['String']['input'];
};

export type CreateStoreApiKeyPayload = {
  __typename?: 'CreateStoreApiKeyPayload';
  apiKey: StoreApiKeyType;
  secret: Scalars['String']['output'];
};

export type CreateStoreAsAdminInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bannerUrl?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  ownerUserId: Scalars['String']['input'];
};

export type CreateTagInput = {
  name: Scalars['String']['input'];
};

export type CustomerAuthPayload = {
  __typename?: 'CustomerAuthPayload';
  customer?: Maybe<CustomerProfile>;
  pendingDeletion?: Maybe<Scalars['Boolean']['output']>;
  reactivationToken?: Maybe<Scalars['String']['output']>;
  tokens?: Maybe<AuthTokens>;
};

export enum CustomerOrderListFilter {
  All = 'ALL',
  Cancelled = 'CANCELLED',
  Delivered = 'DELIVERED',
  InProgress = 'IN_PROGRESS',
  PendingPayment = 'PENDING_PAYMENT',
}

export type CustomerProfile = {
  __typename?: 'CustomerProfile';
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  profilePhotoUrl?: Maybe<Scalars['String']['output']>;
};

export type CustomerReviewType = {
  __typename?: 'CustomerReviewType';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  images: Array<ReviewImageType>;
  orderId: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  productSlug?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

export type CustomerReviewableItemType = {
  __typename?: 'CustomerReviewableItemType';
  deliveredAt: Scalars['DateTime']['output'];
  orderId: Scalars['String']['output'];
  orderItemId: Scalars['String']['output'];
  orderNumber: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  productSlug?: Maybe<Scalars['String']['output']>;
  reviewDeadline?: Maybe<Scalars['DateTime']['output']>;
};

export type DeleteTaxonomyInput = {
  id: Scalars['String']['input'];
  replacementCategoryId?: InputMaybe<Scalars['String']['input']>;
};

export type DeleteTaxonomyResultType = {
  __typename?: 'DeleteTaxonomyResultType';
  deletedCategoryId?: Maybe<Scalars['String']['output']>;
  deletedId: Scalars['String']['output'];
  detachedProductCount: Scalars['Int']['output'];
  notifiedStoreCount: Scalars['Int']['output'];
  reassignedProductCount?: Maybe<Scalars['Int']['output']>;
  replacementCategoryId?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type FavoriteProductInput = {
  productId: Scalars['String']['input'];
};

export type FavoriteType = {
  __typename?: 'FavoriteType';
  id: Scalars['String']['output'];
  product?: Maybe<ProductType>;
  productId: Scalars['String']['output'];
};

export type HealthStatus = {
  __typename?: 'HealthStatus';
  api: Scalars['String']['output'];
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

export type InviteAdminInput = {
  email: Scalars['String']['input'];
};

export type InviteStoreMemberInput = {
  email: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type InviteVendorInput = {
  email: Scalars['String']['input'];
};

export type MeResult = {
  __typename?: 'MeResult';
  customer?: Maybe<CustomerProfile>;
  user?: Maybe<UserProfile>;
};

export type MessagePayload = {
  __typename?: 'MessagePayload';
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptStoreInvitation: StoreMemberType;
  acceptVendorInvitation: VendorAuthPayload;
  acknowledgeVendorOrder: OrderType;
  addFavorite: FavoriteType;
  addPaymentMethod: SavedPaymentMethodType;
  addProductImage: ProductImageType;
  addToCart: CartType;
  adminCreateStoreShippingOption: StoreShippingOptionType;
  adminDeleteStoreShippingOption: Scalars['Boolean']['output'];
  adminLogin: VendorAuthPayload;
  adminTriggerVendorPasswordReset: MessagePayload;
  adminUpdateStoreShippingOption: StoreShippingOptionType;
  approveBrand: BrandType;
  approveCategory: CategoryType;
  approvePetType: PetTypeType;
  approveStore: StoreType;
  approveStoreReactivationRequest: StoreReactivationRequestType;
  approveStoreRequest: StoreRequestType;
  approveTag: TagType;
  cancelVendorOrder: OrderType;
  changeCustomerPhone: CustomerAuthPayload;
  changePassword: MessagePayload;
  confirmGuestOrderDelivered: OrderType;
  confirmOrderDelivered: OrderType;
  createAddress: SavedAddressType;
  createBrand: BrandType;
  createCategory: CategoryType;
  createOrder: OrderType;
  createPayment: PaymentType;
  createPayout: PayoutType;
  createPetType: PetTypeType;
  createPlatformAd: PlatformAdType;
  createPlatformBanner: PlatformBannerType;
  createPlatformSponsor: PlatformSponsorType;
  createProduct: ProductType;
  createProductVariant: ProductVariantType;
  createPromotion: PromotionType;
  createReview: ReviewType;
  createReviewReply: ReviewReplyType;
  createSearchSynonym: SearchSynonymType;
  createShippingOption: StoreShippingOptionType;
  createShippingProvider: ShippingProviderType;
  createStoreApiKey: CreateStoreApiKeyPayload;
  createStoreAsAdmin: AdminStoreType;
  createTag: TagType;
  declineStoreInvitation: Scalars['Boolean']['output'];
  deleteAddress: Scalars['Boolean']['output'];
  deleteBrand: DeleteTaxonomyResultType;
  deleteCategory: DeleteTaxonomyResultType;
  deletePaymentMethod: Scalars['Boolean']['output'];
  deletePetType: DeleteTaxonomyResultType;
  deletePlatformAd: Scalars['Boolean']['output'];
  deletePlatformBanner: Scalars['Boolean']['output'];
  deletePlatformSponsor: Scalars['Boolean']['output'];
  deleteProduct: Scalars['Boolean']['output'];
  deleteProductImage: Scalars['Boolean']['output'];
  deleteProductVariant: Scalars['Boolean']['output'];
  deletePromotion: Scalars['Boolean']['output'];
  deleteSearchSynonym: Scalars['Boolean']['output'];
  deleteShippingOption: Scalars['Boolean']['output'];
  deleteShippingProvider: Scalars['Boolean']['output'];
  deleteTag: DeleteTaxonomyResultType;
  inviteAdmin: AdminInvitationType;
  inviteStoreMember: StoreMemberInvitationType;
  inviteVendor: VendorInvitationType;
  markAllNotificationsRead: Scalars['Boolean']['output'];
  markNotificationRead: Scalars['Boolean']['output'];
  markVendorOrderPaid: OrderType;
  mergeCart: CartType;
  publishProduct: ProductType;
  reactivateAccount: CustomerAuthPayload;
  refreshToken: AuthTokens;
  registerStore: VendorAuthPayload;
  registerVendor: VendorAuthPayload;
  rejectBrand: BrandType;
  rejectCategory: CategoryType;
  rejectPetType: PetTypeType;
  rejectStore: StoreType;
  rejectStoreReactivationRequest: StoreReactivationRequestType;
  rejectStoreRequest: StoreRequestType;
  rejectTag: TagType;
  removeCartItem: CartType;
  removeFavorite: Scalars['Boolean']['output'];
  removeStoreMember: Scalars['Boolean']['output'];
  reorderPlatformBanners: Array<PlatformBannerType>;
  reorderPlatformSponsors: Array<PlatformSponsorType>;
  reorderProductImages: Array<ProductImageType>;
  requestAccountDeletion: Scalars['Boolean']['output'];
  requestPasswordReset: MessagePayload;
  resetPassword: MessagePayload;
  revokeAdminInvitation: AdminInvitationType;
  revokeStoreApiKey: Scalars['Boolean']['output'];
  revokeStoreInvitation: StoreMemberInvitationType;
  sendCustomerOtp: MessagePayload;
  setAdminActive: AdminTeamMemberType;
  setCategoryImage: CategoryType;
  setCustomerActive: AdminCustomerType;
  setDefaultAddress: SavedAddressType;
  setDefaultPaymentMethod: SavedPaymentMethodType;
  setPetTypeImage: PetTypeType;
  setProductThumbnail: ProductImageType;
  shipVendorOrder: OrderType;
  submitStoreReactivationRequest: StoreReactivationRequestType;
  submitStoreRequest: StoreRequestType;
  switchStore: VendorAuthPayload;
  syncProductVariants: Array<ProductVariantType>;
  togglePromotion: PromotionType;
  updateAddress: SavedAddressType;
  updateCartItem: CartType;
  updateCategory: CategoryType;
  updateCustomerAsAdmin: AdminCustomerType;
  updateOrderStatus: OrderType;
  updatePetType: PetTypeType;
  updatePlatformAd: PlatformAdType;
  updatePlatformBanner: PlatformBannerType;
  updatePlatformSponsor: PlatformSponsorType;
  updateProduct: ProductType;
  updateProductImage: ProductImageType;
  updateProductVariant: ProductVariantType;
  updateProfile: CustomerProfile;
  updatePromotion: PromotionType;
  updateReviewReply: ReviewReplyType;
  updateSearchRankingWeights: SearchRankingWeightsType;
  updateSearchSynonym: SearchSynonymType;
  updateShippingOption: StoreShippingOptionType;
  updateShippingProvider: ShippingProviderType;
  updateStore: MyStoreType;
  updateStoreAsAdmin: AdminStoreType;
  updateStoreMemberRole: StoreMemberType;
  updateStorePayout: MyStoreType;
  updateUserProfile: UserProfile;
  updateVendorAsAdmin: AdminVendorType;
  uploadImage: UploadResultType;
  vendorLogin: VendorAuthPayload;
  verifyCustomerOtp: CustomerAuthPayload;
};

export type MutationAcceptStoreInvitationArgs = {
  token: Scalars['String']['input'];
};

export type MutationAcceptVendorInvitationArgs = {
  input: AcceptVendorInvitationInput;
};

export type MutationAcknowledgeVendorOrderArgs = {
  orderId: Scalars['String']['input'];
};

export type MutationAddFavoriteArgs = {
  input: FavoriteProductInput;
};

export type MutationAddPaymentMethodArgs = {
  input: AddPaymentMethodInput;
};

export type MutationAddProductImageArgs = {
  input: AddProductImageInput;
  productId: Scalars['String']['input'];
};

export type MutationAddToCartArgs = {
  input: AddToCartInput;
};

export type MutationAdminCreateStoreShippingOptionArgs = {
  input: CreateShippingOptionInput;
  storeId: Scalars['String']['input'];
};

export type MutationAdminDeleteStoreShippingOptionArgs = {
  id: Scalars['String']['input'];
};

export type MutationAdminLoginArgs = {
  input: VendorLoginInput;
};

export type MutationAdminTriggerVendorPasswordResetArgs = {
  vendorId: Scalars['String']['input'];
};

export type MutationAdminUpdateStoreShippingOptionArgs = {
  id: Scalars['String']['input'];
  input: UpdateShippingOptionInput;
};

export type MutationApproveBrandArgs = {
  id: Scalars['String']['input'];
};

export type MutationApproveCategoryArgs = {
  id: Scalars['String']['input'];
};

export type MutationApprovePetTypeArgs = {
  id: Scalars['String']['input'];
};

export type MutationApproveStoreArgs = {
  input: ApproveStoreInput;
};

export type MutationApproveStoreReactivationRequestArgs = {
  id: Scalars['String']['input'];
};

export type MutationApproveStoreRequestArgs = {
  id: Scalars['String']['input'];
};

export type MutationApproveTagArgs = {
  id: Scalars['String']['input'];
};

export type MutationCancelVendorOrderArgs = {
  orderId: Scalars['String']['input'];
};

export type MutationChangeCustomerPhoneArgs = {
  input: ChangeCustomerPhoneInput;
};

export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};

export type MutationConfirmGuestOrderDeliveredArgs = {
  input: ConfirmOrderDeliveredInput;
};

export type MutationConfirmOrderDeliveredArgs = {
  input: ConfirmOrderDeliveredInput;
};

export type MutationCreateAddressArgs = {
  input: CreateAddressInput;
};

export type MutationCreateBrandArgs = {
  input: CreateBrandInput;
};

export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};

export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};

export type MutationCreatePaymentArgs = {
  input: CreatePaymentInput;
};

export type MutationCreatePayoutArgs = {
  input: CreatePayoutInput;
};

export type MutationCreatePetTypeArgs = {
  input: CreatePetTypeInput;
};

export type MutationCreatePlatformAdArgs = {
  input: CreatePlatformAdInput;
};

export type MutationCreatePlatformBannerArgs = {
  input: CreatePlatformBannerInput;
};

export type MutationCreatePlatformSponsorArgs = {
  input: CreatePlatformSponsorInput;
};

export type MutationCreateProductArgs = {
  input: CreateProductInput;
};

export type MutationCreateProductVariantArgs = {
  input: CreateProductVariantInput;
  productId: Scalars['String']['input'];
};

export type MutationCreatePromotionArgs = {
  input: CreatePromotionInput;
};

export type MutationCreateReviewArgs = {
  input: CreateReviewInput;
};

export type MutationCreateReviewReplyArgs = {
  input: CreateReviewReplyInput;
};

export type MutationCreateSearchSynonymArgs = {
  input: CreateSearchSynonymInput;
};

export type MutationCreateShippingOptionArgs = {
  input: CreateShippingOptionInput;
};

export type MutationCreateShippingProviderArgs = {
  input: CreateShippingProviderInput;
};

export type MutationCreateStoreApiKeyArgs = {
  name: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MutationCreateStoreAsAdminArgs = {
  input: CreateStoreAsAdminInput;
};

export type MutationCreateTagArgs = {
  input: CreateTagInput;
};

export type MutationDeclineStoreInvitationArgs = {
  token: Scalars['String']['input'];
};

export type MutationDeleteAddressArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteBrandArgs = {
  input: DeleteTaxonomyInput;
};

export type MutationDeleteCategoryArgs = {
  input: DeleteTaxonomyInput;
};

export type MutationDeletePaymentMethodArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeletePetTypeArgs = {
  input: DeleteTaxonomyInput;
};

export type MutationDeletePlatformAdArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeletePlatformBannerArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeletePlatformSponsorArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteProductArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteProductImageArgs = {
  imageId: Scalars['String']['input'];
};

export type MutationDeleteProductVariantArgs = {
  variantId: Scalars['String']['input'];
};

export type MutationDeletePromotionArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteSearchSynonymArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteShippingOptionArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteShippingProviderArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteTagArgs = {
  id: Scalars['String']['input'];
};

export type MutationInviteAdminArgs = {
  input: InviteAdminInput;
};

export type MutationInviteStoreMemberArgs = {
  input: InviteStoreMemberInput;
};

export type MutationInviteVendorArgs = {
  input: InviteVendorInput;
};

export type MutationMarkNotificationReadArgs = {
  id: Scalars['String']['input'];
};

export type MutationMarkVendorOrderPaidArgs = {
  orderId: Scalars['String']['input'];
};

export type MutationMergeCartArgs = {
  sessionId: Scalars['String']['input'];
};

export type MutationPublishProductArgs = {
  id: Scalars['String']['input'];
};

export type MutationReactivateAccountArgs = {
  input: ReactivateAccountInput;
};

export type MutationRefreshTokenArgs = {
  input: RefreshTokenInput;
};

export type MutationRegisterStoreArgs = {
  input: RegisterStoreInput;
};

export type MutationRegisterVendorArgs = {
  input: RegisterVendorInput;
};

export type MutationRejectBrandArgs = {
  id: Scalars['String']['input'];
};

export type MutationRejectCategoryArgs = {
  id: Scalars['String']['input'];
};

export type MutationRejectPetTypeArgs = {
  id: Scalars['String']['input'];
};

export type MutationRejectStoreArgs = {
  input: RejectStoreInput;
};

export type MutationRejectStoreReactivationRequestArgs = {
  input: RejectStoreReactivationRequestInput;
};

export type MutationRejectStoreRequestArgs = {
  input: RejectStoreRequestInput;
};

export type MutationRejectTagArgs = {
  id: Scalars['String']['input'];
};

export type MutationRemoveCartItemArgs = {
  input: RemoveCartItemInput;
};

export type MutationRemoveFavoriteArgs = {
  input: FavoriteProductInput;
};

export type MutationRemoveStoreMemberArgs = {
  memberId: Scalars['String']['input'];
};

export type MutationReorderPlatformBannersArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type MutationReorderPlatformSponsorsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type MutationReorderProductImagesArgs = {
  imageIds: Array<Scalars['ID']['input']>;
  productId: Scalars['String']['input'];
};

export type MutationRequestPasswordResetArgs = {
  input: RequestPasswordResetInput;
};

export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};

export type MutationRevokeAdminInvitationArgs = {
  invitationId: Scalars['String']['input'];
};

export type MutationRevokeStoreApiKeyArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MutationRevokeStoreInvitationArgs = {
  invitationId: Scalars['String']['input'];
};

export type MutationSendCustomerOtpArgs = {
  input: SendCustomerOtpInput;
};

export type MutationSetAdminActiveArgs = {
  isActive: Scalars['Boolean']['input'];
  userId: Scalars['String']['input'];
};

export type MutationSetCategoryImageArgs = {
  input: SetCategoryImageInput;
};

export type MutationSetCustomerActiveArgs = {
  id: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
};

export type MutationSetDefaultAddressArgs = {
  id: Scalars['String']['input'];
};

export type MutationSetDefaultPaymentMethodArgs = {
  id: Scalars['String']['input'];
};

export type MutationSetPetTypeImageArgs = {
  input: SetPetTypeImageInput;
};

export type MutationSetProductThumbnailArgs = {
  imageId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};

export type MutationShipVendorOrderArgs = {
  input: ShipVendorOrderInput;
};

export type MutationSubmitStoreReactivationRequestArgs = {
  input: SubmitStoreReactivationRequestInput;
};

export type MutationSubmitStoreRequestArgs = {
  input: SubmitStoreRequestInput;
};

export type MutationSwitchStoreArgs = {
  input: SwitchStoreInput;
};

export type MutationSyncProductVariantsArgs = {
  productId: Scalars['String']['input'];
  variants: Array<SyncProductVariantItemInput>;
};

export type MutationTogglePromotionArgs = {
  id: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
};

export type MutationUpdateAddressArgs = {
  id: Scalars['String']['input'];
  input: UpdateAddressInput;
};

export type MutationUpdateCartItemArgs = {
  input: UpdateCartItemInput;
};

export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
};

export type MutationUpdateCustomerAsAdminArgs = {
  input: UpdateCustomerAsAdminInput;
};

export type MutationUpdateOrderStatusArgs = {
  input: UpdateOrderStatusInput;
};

export type MutationUpdatePetTypeArgs = {
  input: UpdatePetTypeInput;
};

export type MutationUpdatePlatformAdArgs = {
  input: UpdatePlatformAdInput;
};

export type MutationUpdatePlatformBannerArgs = {
  input: UpdatePlatformBannerInput;
};

export type MutationUpdatePlatformSponsorArgs = {
  input: UpdatePlatformSponsorInput;
};

export type MutationUpdateProductArgs = {
  id: Scalars['String']['input'];
  input: UpdateProductInput;
};

export type MutationUpdateProductImageArgs = {
  imageId: Scalars['String']['input'];
  input: UpdateProductImageInput;
};

export type MutationUpdateProductVariantArgs = {
  input: UpdateProductVariantInput;
  variantId: Scalars['String']['input'];
};

export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type MutationUpdatePromotionArgs = {
  id: Scalars['String']['input'];
  input: UpdatePromotionInput;
};

export type MutationUpdateReviewReplyArgs = {
  input: UpdateReviewReplyInput;
};

export type MutationUpdateSearchRankingWeightsArgs = {
  input: UpdateSearchRankingWeightsInput;
};

export type MutationUpdateSearchSynonymArgs = {
  id: Scalars['String']['input'];
  input: UpdateSearchSynonymInput;
};

export type MutationUpdateShippingOptionArgs = {
  id: Scalars['String']['input'];
  input: UpdateShippingOptionInput;
};

export type MutationUpdateShippingProviderArgs = {
  id: Scalars['String']['input'];
  input: UpdateShippingProviderInput;
};

export type MutationUpdateStoreArgs = {
  input: UpdateStoreSettingsInput;
};

export type MutationUpdateStoreAsAdminArgs = {
  input: UpdateStoreAsAdminInput;
};

export type MutationUpdateStoreMemberRoleArgs = {
  input: UpdateStoreMemberRoleInput;
};

export type MutationUpdateStorePayoutArgs = {
  input: UpdateStorePayoutInput;
};

export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};

export type MutationUpdateVendorAsAdminArgs = {
  input: UpdateVendorAsAdminInput;
};

export type MutationUploadImageArgs = {
  base64: Scalars['String']['input'];
  folder?: InputMaybe<Scalars['String']['input']>;
};

export type MutationVendorLoginArgs = {
  input: VendorLoginInput;
};

export type MutationVerifyCustomerOtpArgs = {
  input: VerifyCustomerOtpInput;
};

export type MyStoreType = {
  __typename?: 'MyStoreType';
  address?: Maybe<Scalars['String']['output']>;
  bankAccountName?: Maybe<Scalars['String']['output']>;
  bankAccountNumber?: Maybe<Scalars['String']['output']>;
  bankCode?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  bannerUrl?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  omiseRecipientFailureMessage?: Maybe<Scalars['String']['output']>;
  omiseRecipientId?: Maybe<Scalars['String']['output']>;
  omiseRecipientStatus: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type NotificationType = {
  __typename?: 'NotificationType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type OrderConnection = {
  __typename?: 'OrderConnection';
  items: Array<OrderType>;
  pagination: PaginationMeta;
};

export type OrderItemInput = {
  price: Scalars['Float']['input'];
  productId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  variantId?: InputMaybe<Scalars['String']['input']>;
};

export type OrderItemType = {
  __typename?: 'OrderItemType';
  fulfillmentProvider?: Maybe<Scalars['String']['output']>;
  fulfillmentStatus: Scalars['String']['output'];
  id: Scalars['String']['output'];
  productId?: Maybe<Scalars['String']['output']>;
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  storeId: Scalars['String']['output'];
  subtotal: Scalars['Float']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  trackingUrl?: Maybe<Scalars['String']['output']>;
  unitPrice: Scalars['Float']['output'];
  variantId: Scalars['String']['output'];
};

export type OrderShippingAddressType = {
  __typename?: 'OrderShippingAddressType';
  addressLine1: Scalars['String']['output'];
  addressLine2?: Maybe<Scalars['String']['output']>;
  amphoe: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  province: Scalars['String']['output'];
  tumbon?: Maybe<Scalars['String']['output']>;
};

export type OrderStoreShippingType = {
  __typename?: 'OrderStoreShippingType';
  optionName: Scalars['String']['output'];
  shippingFee: Scalars['Float']['output'];
  storeId: Scalars['String']['output'];
};

export type OrderTrackingItemType = {
  __typename?: 'OrderTrackingItemType';
  fulfillmentProvider?: Maybe<Scalars['String']['output']>;
  fulfillmentStatus: Scalars['String']['output'];
  productId?: Maybe<Scalars['String']['output']>;
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  storeId: Scalars['String']['output'];
  subtotal: Scalars['Float']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  trackingUrl?: Maybe<Scalars['String']['output']>;
  unitPrice: Scalars['Float']['output'];
};

export type OrderTrackingStoreShippingType = {
  __typename?: 'OrderTrackingStoreShippingType';
  optionName: Scalars['String']['output'];
  shippingFee: Scalars['Float']['output'];
  storeId: Scalars['String']['output'];
};

export type OrderTrackingType = {
  __typename?: 'OrderTrackingType';
  createdAt: Scalars['DateTime']['output'];
  discountAmount: Scalars['Float']['output'];
  items: Array<OrderTrackingItemType>;
  orderNumber: Scalars['String']['output'];
  shippingFee: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  storeShippings: Array<OrderTrackingStoreShippingType>;
  subtotal: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type OrderType = {
  __typename?: 'OrderType';
  createdAt: Scalars['DateTime']['output'];
  discountAmount: Scalars['Float']['output'];
  guestEmail?: Maybe<Scalars['String']['output']>;
  guestName?: Maybe<Scalars['String']['output']>;
  guestPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  items: Array<OrderItemType>;
  orderNumber: Scalars['String']['output'];
  paymentMethod: Scalars['String']['output'];
  shippingAddress?: Maybe<OrderShippingAddressType>;
  shippingFee: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  storeShippings: Array<OrderStoreShippingType>;
  subtotal: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type PaginationMeta = {
  __typename?: 'PaginationMeta';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaymentType = {
  __typename?: 'PaymentType';
  amount: Scalars['Float']['output'];
  authorizeUri?: Maybe<Scalars['String']['output']>;
  currency: Scalars['String']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  paymentMethod: Scalars['String']['output'];
  qrCodeUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type PayoutType = {
  __typename?: 'PayoutType';
  amount: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  netAmount: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
};

export type PetTypeType = {
  __typename?: 'PetTypeType';
  approvalStatus: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PlatformAdType = {
  __typename?: 'PlatformAdType';
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  linkUrl?: Maybe<Scalars['String']['output']>;
  sortOrder: Scalars['Int']['output'];
  startsAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
};

export type PlatformAnalyticsType = {
  __typename?: 'PlatformAnalyticsType';
  averageOrderValue: Scalars['Float']['output'];
  pendingStores: Scalars['Int']['output'];
  totalCustomers: Scalars['Int']['output'];
  totalOrders: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
  totalStores: Scalars['Int']['output'];
};

export type PlatformBannerType = {
  __typename?: 'PlatformBannerType';
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  linkUrl?: Maybe<Scalars['String']['output']>;
  mobileImageUrl?: Maybe<Scalars['String']['output']>;
  sortOrder: Scalars['Int']['output'];
  startsAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
};

export type PlatformSettingsType = {
  __typename?: 'PlatformSettingsType';
  currency: Scalars['String']['output'];
  storefrontUrl: Scalars['String']['output'];
  supportEmail: Scalars['String']['output'];
};

export type PlatformSponsorType = {
  __typename?: 'PlatformSponsorType';
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  linkUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
  startsAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ProductConnection = {
  __typename?: 'ProductConnection';
  items: Array<ProductType>;
  pagination: PaginationMeta;
};

export type ProductImageType = {
  __typename?: 'ProductImageType';
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isThumbnail: Scalars['Boolean']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type ProductPublishChecklistItemType = {
  __typename?: 'ProductPublishChecklistItemType';
  complete: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
};

export type ProductPublishChecklistType = {
  __typename?: 'ProductPublishChecklistType';
  canPublish: Scalars['Boolean']['output'];
  items: Array<ProductPublishChecklistItemType>;
  missingKeys: Array<Scalars['String']['output']>;
};

export type ProductReviewBreakdownType = {
  __typename?: 'ProductReviewBreakdownType';
  averageRating: Scalars['Float']['output'];
  productId: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  reviewCount: Scalars['Int']['output'];
};

export type ProductType = {
  __typename?: 'ProductType';
  averageRating: Scalars['Float']['output'];
  basePrice: Scalars['Float']['output'];
  brandId?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  categoryId?: Maybe<Scalars['String']['output']>;
  compareAtPrice?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  expiryDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  images?: Maybe<Array<ProductImageType>>;
  name: Scalars['String']['output'];
  petTypeId?: Maybe<Scalars['String']['output']>;
  reviewCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  soldCount: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  store?: Maybe<StoreType>;
  storeId: Scalars['String']['output'];
  tagIds?: Maybe<Array<Scalars['String']['output']>>;
  tags: Array<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  variants?: Maybe<Array<ProductVariantType>>;
  warning?: Maybe<Scalars['String']['output']>;
};

export type ProductVariantType = {
  __typename?: 'ProductVariantType';
  id: Scalars['String']['output'];
  optionsJson?: Maybe<Scalars['String']['output']>;
  price: Scalars['Float']['output'];
  product?: Maybe<ProductType>;
  sku: Scalars['String']['output'];
  stockQuantity: Scalars['Int']['output'];
};

export type PromotionType = {
  __typename?: 'PromotionType';
  autoApply: Scalars['Boolean']['output'];
  code: Scalars['String']['output'];
  conditions?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  discountValue: Scalars['Float']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  maxDiscountAmount?: Maybe<Scalars['Float']['output']>;
  minPurchaseAmount?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
  scope: Scalars['String']['output'];
  startsAt?: Maybe<Scalars['DateTime']['output']>;
  storeId?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  usageCount: Scalars['Int']['output'];
  usageLimit?: Maybe<Scalars['Int']['output']>;
  usagePerCustomer: Scalars['Int']['output'];
};

export type PromotionValidationResult = {
  __typename?: 'PromotionValidationResult';
  code: Scalars['String']['output'];
  discountAmount: Scalars['Float']['output'];
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  activePlatformPromotions: Array<PromotionType>;
  activeStorePromotions: Array<PromotionType>;
  addresses: Array<SavedAddressType>;
  adminCustomer: AdminCustomerType;
  adminCustomers: AdminCustomerConnection;
  adminStore: AdminStoreType;
  adminStoreReactivationRequests: Array<StoreReactivationRequestType>;
  adminStoreShippingOptions: Array<StoreShippingOptionType>;
  adminStores: Array<AdminStoreType>;
  adminTeamMembers: Array<AdminTeamMemberType>;
  adminVendor: AdminVendorType;
  adminVendors: Array<AdminVendorType>;
  allPlatformAds: Array<PlatformAdType>;
  allPlatformBanners: Array<PlatformBannerType>;
  allPlatformSponsors: Array<PlatformSponsorType>;
  approvedBrands: Array<BrandType>;
  approvedCategories: Array<CategoryType>;
  approvedPetTypes: Array<PetTypeType>;
  approvedTags: Array<TagType>;
  brandDeleteImpact: TaxonomyDeleteImpactType;
  cart: CartType;
  categoryDeleteImpact: TaxonomyDeleteImpactType;
  customerReviewableItems: Array<CustomerReviewableItemType>;
  exportSearchAnalyticsCsv: Scalars['String']['output'];
  favorites: Array<FavoriteType>;
  guestOrders: Array<OrderType>;
  /** GraphQL API health check */
  health: HealthStatus;
  latestPurchaseProduct?: Maybe<ProductType>;
  latestPurchaseProducts: Array<ProductType>;
  me: MeResult;
  myBrandProposals: Array<BrandType>;
  myCategoryProposals: Array<CategoryType>;
  myPetTypeProposals: Array<PetTypeType>;
  myReviews: Array<CustomerReviewType>;
  myStore: MyStoreType;
  myStoreRequests: Array<StoreRequestType>;
  myStoreShippingOptions: Array<StoreShippingOptionType>;
  myStores: Array<VendorStoreType>;
  myTagProposals: Array<TagType>;
  notifications: Array<NotificationType>;
  order: OrderType;
  orderTracking: OrderTrackingType;
  orders: OrderConnection;
  payment: PaymentType;
  paymentByOrderId: PaymentType;
  paymentMethods: Array<SavedPaymentMethodType>;
  pendingAdminInvitations: Array<AdminInvitationType>;
  pendingBrands: Array<BrandType>;
  pendingCategories: Array<CategoryType>;
  pendingPetTypes: Array<PetTypeType>;
  pendingStoreRequests: Array<StoreRequestType>;
  pendingStores: Array<StoreType>;
  pendingTags: Array<TagType>;
  pendingVendorInvitations: Array<VendorInvitationType>;
  petTypeDeleteImpact: TaxonomyDeleteImpactType;
  platformAds: Array<PlatformAdType>;
  platformAnalytics: PlatformAnalyticsType;
  platformBanners: Array<PlatformBannerType>;
  platformPromotions: Array<PromotionType>;
  platformSalesByCategory: Array<SalesBreakdownItemType>;
  platformSalesByPaymentMethod: Array<SalesBreakdownItemType>;
  platformSalesOverTime: Array<SalesTimePointType>;
  platformSettings: PlatformSettingsType;
  platformSponsors: Array<PlatformSponsorType>;
  platformTopProducts: Array<TopProductType>;
  platformTopStores: Array<TopStoreType>;
  product: ProductType;
  productBySlug: ProductType;
  productPublishChecklist: ProductPublishChecklistType;
  productReviews: Array<ReviewType>;
  products: ProductConnection;
  recommendedProducts: Array<ProductType>;
  rejectedCategories: Array<CategoryType>;
  rejectedTags: Array<TagType>;
  searchAnalyticsSuggestionCtr: Array<SearchSuggestionCtrRowType>;
  searchAnalyticsSummary: SearchAnalyticsSummaryType;
  searchAnalyticsTopQueries: Array<SearchAnalyticsQueryRowType>;
  searchAnalyticsZeroResultQueries: Array<SearchAnalyticsQueryRowType>;
  searchRankingWeights: SearchRankingWeightsType;
  searchRecoverySuggestions: Array<Scalars['String']['output']>;
  searchSuggestions: SearchSuggestionsPayloadType;
  searchSynonyms: Array<SearchSynonymType>;
  shippingProviders: Array<ShippingProviderType>;
  store: StoreType;
  storeAnalytics: StoreAnalyticsType;
  storeApiKeys: Array<StoreApiKeyType>;
  storeBySlug: StoreType;
  storeInvitations: Array<StoreMemberInvitationType>;
  storeMembers: Array<StoreMemberType>;
  storePayouts: Array<PayoutType>;
  storeProductReviews: StoreProductReviewConnection;
  storePromotions: Array<PromotionType>;
  storeReactivationRequests: Array<StoreReactivationRequestType>;
  storeReviewSummary: StoreReviewSummaryType;
  storeReviews: Array<StoreProductReviewType>;
  storeShippingOptions: Array<StoreShippingOptionType>;
  stores: Array<StoreType>;
  tagDeleteImpact: TaxonomyDeleteImpactType;
  topProducts: Array<TopProductType>;
  unreadNotificationsCount: Scalars['Int']['output'];
  validatePromotion: PromotionValidationResult;
  vendorCustomer: VendorCustomerType;
  vendorCustomers: VendorCustomerConnection;
  vendorOrders: Array<OrderType>;
  vendorProduct: ProductType;
  vendorProducts: ProductConnection;
};

export type QueryActiveStorePromotionsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryAdminCustomerArgs = {
  id: Scalars['String']['input'];
};

export type QueryAdminCustomersArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryAdminStoreArgs = {
  id: Scalars['String']['input'];
};

export type QueryAdminStoreReactivationRequestsArgs = {
  status?: InputMaybe<Scalars['String']['input']>;
};

export type QueryAdminStoreShippingOptionsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryAdminVendorArgs = {
  id: Scalars['String']['input'];
};

export type QueryAdminVendorsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryBrandDeleteImpactArgs = {
  brandId: Scalars['String']['input'];
};

export type QueryCartArgs = {
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryCategoryDeleteImpactArgs = {
  categoryId: Scalars['String']['input'];
};

export type QueryExportSearchAnalyticsCsvArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QueryGuestOrdersArgs = {
  guestPhone: Scalars['String']['input'];
};

export type QueryLatestPurchaseProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryMyReviewsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryNotificationsArgs = {
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryOrderArgs = {
  id: Scalars['String']['input'];
};

export type QueryOrderTrackingArgs = {
  orderNumber: Scalars['String']['input'];
};

export type QueryOrdersArgs = {
  filter?: InputMaybe<CustomerOrderListFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPaymentArgs = {
  id: Scalars['String']['input'];
};

export type QueryPaymentByOrderIdArgs = {
  orderId: Scalars['String']['input'];
};

export type QueryPetTypeDeleteImpactArgs = {
  petTypeId: Scalars['String']['input'];
};

export type QueryPlatformAnalyticsArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPlatformSalesByCategoryArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPlatformSalesByPaymentMethodArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPlatformSalesOverTimeArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPlatformTopProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPlatformTopStoresArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryProductArgs = {
  id: Scalars['String']['input'];
};

export type QueryProductBySlugArgs = {
  slug: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueryProductPublishChecklistArgs = {
  productId: Scalars['String']['input'];
};

export type QueryProductReviewsArgs = {
  productId: Scalars['String']['input'];
};

export type QueryProductsArgs = {
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  category?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxPrice?: InputMaybe<Scalars['Int']['input']>;
  minPrice?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  petTypeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
  searchContext?: InputMaybe<SearchContextInput>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
};

export type QueryRecommendedProductsArgs = {
  excludeProductIds?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  searchContext?: InputMaybe<SearchContextInput>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  shuffleSeed?: InputMaybe<Scalars['String']['input']>;
};

export type QuerySearchAnalyticsSuggestionCtrArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QuerySearchAnalyticsSummaryArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QuerySearchAnalyticsTopQueriesArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QuerySearchAnalyticsZeroResultQueriesArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QuerySearchRecoverySuggestionsArgs = {
  query: Scalars['String']['input'];
};

export type QuerySearchSuggestionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryShippingProvidersArgs = {
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryStoreArgs = {
  id: Scalars['String']['input'];
};

export type QueryStoreAnalyticsArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  toDate?: InputMaybe<Scalars['String']['input']>;
};

export type QueryStoreApiKeysArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryStoreBySlugArgs = {
  slug: Scalars['String']['input'];
};

export type QueryStoreProductReviewsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  ratingFilter?: InputMaybe<Scalars['String']['input']>;
  replyFilter?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};

export type QueryStorePromotionsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryStoreReactivationRequestsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryStoreReviewSummaryArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryStoreReviewsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryStoreShippingOptionsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryTagDeleteImpactArgs = {
  tagId: Scalars['String']['input'];
};

export type QueryTopProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  storeId: Scalars['String']['input'];
};

export type QueryValidatePromotionArgs = {
  input: ValidatePromotionInput;
};

export type QueryVendorCustomerArgs = {
  id: Scalars['String']['input'];
};

export type QueryVendorCustomersArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryVendorOrdersArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryVendorProductArgs = {
  id: Scalars['String']['input'];
};

export type QueryVendorProductsArgs = {
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  category?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  petTypeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type ReactivateAccountInput = {
  reactivationToken: Scalars['String']['input'];
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type RegisterStoreInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bankAccountName?: InputMaybe<Scalars['String']['input']>;
  bankAccountNumber?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  ownerEmail: Scalars['String']['input'];
  ownerFullName: Scalars['String']['input'];
  ownerPassword: Scalars['String']['input'];
};

export type RegisterVendorInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type RejectStoreInput = {
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};

export type RejectStoreReactivationRequestInput = {
  id: Scalars['String']['input'];
  reviewNote?: InputMaybe<Scalars['String']['input']>;
};

export type RejectStoreRequestInput = {
  id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type RemoveCartItemInput = {
  itemId: Scalars['String']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type RequestPasswordResetInput = {
  email: Scalars['String']['input'];
};

export type ResetPasswordInput = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type ReviewImageType = {
  __typename?: 'ReviewImageType';
  id: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ReviewReplyType = {
  __typename?: 'ReviewReplyType';
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ReviewType = {
  __typename?: 'ReviewType';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customerName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  images: Array<ReviewImageType>;
  productId: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
  reply?: Maybe<ReviewReplyType>;
  status: Scalars['String']['output'];
};

export type SalesBreakdownItemType = {
  __typename?: 'SalesBreakdownItemType';
  label: Scalars['String']['output'];
  orderCount: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
};

export type SalesTimePointType = {
  __typename?: 'SalesTimePointType';
  date: Scalars['String']['output'];
  orderCount: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
};

export type SavedAddressType = {
  __typename?: 'SavedAddressType';
  addressLine1: Scalars['String']['output'];
  addressLine2?: Maybe<Scalars['String']['output']>;
  amphoe: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  label?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  province: Scalars['String']['output'];
  tumbon?: Maybe<Scalars['String']['output']>;
};

export type SavedPaymentMethodType = {
  __typename?: 'SavedPaymentMethodType';
  brand: Scalars['String']['output'];
  expiryMonth: Scalars['Int']['output'];
  expiryYear: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  lastFour: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type SearchAnalyticsQueryRowType = {
  __typename?: 'SearchAnalyticsQueryRowType';
  avgResultCount: Scalars['Float']['output'];
  query: Scalars['String']['output'];
  searchCount: Scalars['Int']['output'];
};

export type SearchAnalyticsSummaryType = {
  __typename?: 'SearchAnalyticsSummaryType';
  avgLatencyMs: Scalars['Float']['output'];
  avgResultsPerQuery: Scalars['Float']['output'];
  totalSearches: Scalars['Int']['output'];
  uniqueQueries: Scalars['Int']['output'];
  zeroResultRate: Scalars['Float']['output'];
};

export type SearchContextInput = {
  recentProductIds?: InputMaybe<Array<Scalars['String']['input']>>;
  recentQueries?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SearchProductSuggestionType = {
  __typename?: 'SearchProductSuggestionType';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
};

export type SearchQuerySuggestionType = {
  __typename?: 'SearchQuerySuggestionType';
  query: Scalars['String']['output'];
};

export type SearchRankingWeightsType = {
  __typename?: 'SearchRankingWeightsType';
  averageRating: Scalars['Float']['output'];
  personalizationCap: Scalars['Float']['output'];
  prefixBoost: Scalars['Float']['output'];
  reviewCount: Scalars['Float']['output'];
  rrfK: Scalars['Int']['output'];
  soldCount: Scalars['Float']['output'];
  text: Scalars['Float']['output'];
  trigramFallbackThreshold: Scalars['Int']['output'];
  trigramMinSimilarity: Scalars['Float']['output'];
};

export type SearchSuggestionCtrRowType = {
  __typename?: 'SearchSuggestionCtrRowType';
  clicks: Scalars['Int']['output'];
  ctr: Scalars['Float']['output'];
  impressions: Scalars['Int']['output'];
  prefixBucket: Scalars['String']['output'];
};

export type SearchSuggestionsPayloadType = {
  __typename?: 'SearchSuggestionsPayloadType';
  products: Array<SearchProductSuggestionType>;
  queries: Array<SearchQuerySuggestionType>;
};

export type SearchSynonymType = {
  __typename?: 'SearchSynonymType';
  expansion: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  terms: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type SendCustomerOtpInput = {
  phone: Scalars['String']['input'];
};

export type SetCategoryImageInput = {
  categoryId: Scalars['String']['input'];
  imageUrl: Scalars['String']['input'];
};

export type SetPetTypeImageInput = {
  imageUrl: Scalars['String']['input'];
  petTypeId: Scalars['String']['input'];
};

export type ShipVendorOrderInput = {
  fulfillmentProvider: Scalars['String']['input'];
  orderId: Scalars['String']['input'];
  trackingNumber: Scalars['String']['input'];
  trackingUrl?: InputMaybe<Scalars['String']['input']>;
};

export type ShippingAddressInput = {
  addressLine1: Scalars['String']['input'];
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  amphoe: Scalars['String']['input'];
  city?: InputMaybe<Scalars['String']['input']>;
  postalCode: Scalars['String']['input'];
  province: Scalars['String']['input'];
  recipientName: Scalars['String']['input'];
  recipientPhone: Scalars['String']['input'];
  tumbon?: InputMaybe<Scalars['String']['input']>;
};

export type ShippingProviderType = {
  __typename?: 'ShippingProviderType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type StoreAnalyticsType = {
  __typename?: 'StoreAnalyticsType';
  pendingOrders: Scalars['Int']['output'];
  recentOrders: Scalars['Int']['output'];
  totalOrders: Scalars['Int']['output'];
  totalProducts: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
};

export type StoreApiKeyType = {
  __typename?: 'StoreApiKeyType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  keyPrefix: Scalars['String']['output'];
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type StoreMemberInvitationType = {
  __typename?: 'StoreMemberInvitationType';
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  role: Scalars['String']['output'];
  status: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
};

export type StoreMemberType = {
  __typename?: 'StoreMemberType';
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  role: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type StoreProductReviewConnection = {
  __typename?: 'StoreProductReviewConnection';
  items: Array<StoreProductReviewType>;
  pagination: PaginationMeta;
};

export type StoreProductReviewType = {
  __typename?: 'StoreProductReviewType';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customerName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  images: Array<ReviewImageType>;
  productId: Scalars['String']['output'];
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  productSlug?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Int']['output'];
  reply?: Maybe<ReviewReplyType>;
};

export type StoreReactivationRequestImageType = {
  __typename?: 'StoreReactivationRequestImageType';
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type StoreReactivationRequestType = {
  __typename?: 'StoreReactivationRequestType';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  images: Array<StoreReactivationRequestImageType>;
  reviewNote?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
  storeName: Scalars['String']['output'];
  submittedByEmail?: Maybe<Scalars['String']['output']>;
  submittedByFullName?: Maybe<Scalars['String']['output']>;
  submittedByUserId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type StoreRequestType = {
  __typename?: 'StoreRequestType';
  address?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdStoreId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  storeName: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  vendorUserId: Scalars['String']['output'];
};

export type StoreReviewSummaryType = {
  __typename?: 'StoreReviewSummaryType';
  averageRating: Scalars['Float']['output'];
  productBreakdown: Array<ProductReviewBreakdownType>;
  rating1Count: Scalars['Int']['output'];
  rating2Count: Scalars['Int']['output'];
  rating3Count: Scalars['Int']['output'];
  rating4Count: Scalars['Int']['output'];
  rating5Count: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type StoreShippingOptionType = {
  __typename?: 'StoreShippingOptionType';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  providerId?: Maybe<Scalars['String']['output']>;
  sortOrder: Scalars['Int']['output'];
  storeId: Scalars['String']['output'];
};

export type StoreShippingSelectionInput = {
  shippingOptionId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type StoreType = {
  __typename?: 'StoreType';
  bannerUrl?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type SubmitStoreReactivationRequestInput = {
  content: Scalars['String']['input'];
  mediaUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  storeId: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type SubmitStoreRequestInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  storeName: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  paymentStatusUpdated: PaymentType;
};

export type SubscriptionPaymentStatusUpdatedArgs = {
  orderId?: InputMaybe<Scalars['String']['input']>;
  paymentId?: InputMaybe<Scalars['String']['input']>;
};

export type SwitchStoreInput = {
  storeId: Scalars['String']['input'];
};

export type SyncProductVariantItemInput = {
  /** JSON object of variant options (e.g. {"color":"red","size":"M"}) */
  attributes: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  priceModifier?: InputMaybe<Scalars['Float']['input']>;
  sku: Scalars['String']['input'];
  stockQuantity: Scalars['Int']['input'];
};

export type TagType = {
  __typename?: 'TagType';
  approvalStatus: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TaxonomyDeleteImpactProductType = {
  __typename?: 'TaxonomyDeleteImpactProductType';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type TaxonomyDeleteImpactType = {
  __typename?: 'TaxonomyDeleteImpactType';
  productCount: Scalars['Int']['output'];
  products: Array<TaxonomyDeleteImpactProductType>;
};

export type TopProductType = {
  __typename?: 'TopProductType';
  name: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  revenue: Scalars['Float']['output'];
  unitsSold: Scalars['Int']['output'];
};

export type TopStoreType = {
  __typename?: 'TopStoreType';
  orderCount: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
  storeId: Scalars['String']['output'];
  storeName: Scalars['String']['output'];
};

export type UpdateAddressInput = {
  addressLine1?: InputMaybe<Scalars['String']['input']>;
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  amphoe?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  province?: InputMaybe<Scalars['String']['input']>;
  recipientName?: InputMaybe<Scalars['String']['input']>;
  recipientPhone?: InputMaybe<Scalars['String']['input']>;
  tumbon?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCartItemInput = {
  itemId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCategoryInput = {
  categoryId: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type UpdateCustomerAsAdminInput = {
  dateOfBirth?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderStatusInput = {
  orderId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};

export type UpdatePetTypeInput = {
  name: Scalars['String']['input'];
  petTypeId: Scalars['String']['input'];
};

export type UpdatePlatformAdInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePlatformBannerInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  mobileImageUrl?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePlatformSponsorInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateProductImageInput = {
  altText?: InputMaybe<Scalars['String']['input']>;
  isThumbnail?: InputMaybe<Scalars['Boolean']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProductInput = {
  basePrice?: InputMaybe<Scalars['Float']['input']>;
  brandId?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  compareAtPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  petTypeId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  warning?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductVariantInput = {
  /** JSON object of variant attributes (e.g. {"size":"M","color":"Red"}) */
  attributes?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  priceModifier?: InputMaybe<Scalars['Float']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  stockQuantity?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProfileInput = {
  dateOfBirth?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  profilePhotoUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePromotionInput = {
  autoApply?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  conditions?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  discountValue?: InputMaybe<Scalars['Float']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxDiscountAmount?: InputMaybe<Scalars['Float']['input']>;
  minPurchaseAmount?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  usageLimit?: InputMaybe<Scalars['Int']['input']>;
  usagePerCustomer?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateReviewReplyInput = {
  body: Scalars['String']['input'];
  replyId: Scalars['String']['input'];
};

export type UpdateSearchRankingWeightsInput = {
  averageRating?: InputMaybe<Scalars['Float']['input']>;
  personalizationCap?: InputMaybe<Scalars['Float']['input']>;
  prefixBoost?: InputMaybe<Scalars['Float']['input']>;
  reviewCount?: InputMaybe<Scalars['Float']['input']>;
  rrfK?: InputMaybe<Scalars['Int']['input']>;
  soldCount?: InputMaybe<Scalars['Float']['input']>;
  text?: InputMaybe<Scalars['Float']['input']>;
  trigramFallbackThreshold?: InputMaybe<Scalars['Int']['input']>;
  trigramMinSimilarity?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateSearchSynonymInput = {
  expansion?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  terms?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateShippingOptionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateShippingProviderInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStoreAsAdminInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bannerUrl?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  ownerId?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStoreMemberRoleInput = {
  memberId: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type UpdateStorePayoutInput = {
  bankAccountName?: InputMaybe<Scalars['String']['input']>;
  bankAccountNumber?: InputMaybe<Scalars['String']['input']>;
  bankCode?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStoreSettingsInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bannerUrl?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserProfileInput = {
  fullName?: InputMaybe<Scalars['String']['input']>;
  profilePhotoUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateVendorAsAdminInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UploadResultType = {
  __typename?: 'UploadResultType';
  key: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type UserProfile = {
  __typename?: 'UserProfile';
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  profilePhotoUrl?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  storeId?: Maybe<Scalars['String']['output']>;
};

export type ValidatePromotionInput = {
  code: Scalars['String']['input'];
  storeId?: InputMaybe<Scalars['String']['input']>;
  subtotal: Scalars['Float']['input'];
};

export type VendorAuthPayload = {
  __typename?: 'VendorAuthPayload';
  tokens: AuthTokens;
  user: UserProfile;
};

export type VendorCustomerConnection = {
  __typename?: 'VendorCustomerConnection';
  items: Array<VendorCustomerType>;
  pagination: PaginationMeta;
};

export type VendorCustomerType = {
  __typename?: 'VendorCustomerType';
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  phone: Scalars['String']['output'];
};

export type VendorInvitationType = {
  __typename?: 'VendorInvitationType';
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type VendorLoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type VendorStoreType = {
  __typename?: 'VendorStoreType';
  membershipRole: Scalars['String']['output'];
  store: StoreType;
};

export type VerifyCustomerOtpInput = {
  code: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type NotificationsQueryVariables = Exact<{
  unreadOnly?: boolean | null | undefined;
}>;

export type NotificationsQuery = {
  notifications: Array<{
    id: string;
    type: string;
    title: string | null;
    message: string;
    metadata: string | null;
    isRead: boolean;
    createdAt: string;
  }>;
};

export type MarkNotificationReadMutationVariables = Exact<{
  id: string;
}>;

export type MarkNotificationReadMutation = { markNotificationRead: boolean };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never }>;

export type MarkAllNotificationsReadMutation = { markAllNotificationsRead: boolean };

export type UnreadNotificationsCountQueryVariables = Exact<{ [key: string]: never }>;

export type UnreadNotificationsCountQuery = { unreadNotificationsCount: number };

export type PromotionFieldsFragment = {
  id: string;
  storeId: string | null;
  code: string;
  name: string;
  description: string | null;
  type: string;
  scope: string;
  discountValue: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usagePerCustomer: number;
  usageCount: number;
  isActive: boolean;
  autoApply: boolean;
  priority: number;
  conditions: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type StorePromotionsQueryVariables = Exact<{
  storeId: string;
}>;

export type StorePromotionsQuery = {
  storePromotions: Array<{
    id: string;
    storeId: string | null;
    code: string;
    name: string;
    description: string | null;
    type: string;
    scope: string;
    discountValue: number;
    minPurchaseAmount: number | null;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
    usagePerCustomer: number;
    usageCount: number;
    isActive: boolean;
    autoApply: boolean;
    priority: number;
    conditions: string | null;
    startsAt: string | null;
    expiresAt: string | null;
    createdAt: string;
  }>;
};

export type SearchRankingWeightsQueryVariables = Exact<{ [key: string]: never }>;

export type SearchRankingWeightsQuery = {
  searchRankingWeights: {
    text: number;
    prefixBoost: number;
    soldCount: number;
    averageRating: number;
    reviewCount: number;
    personalizationCap: number;
    trigramFallbackThreshold: number;
    trigramMinSimilarity: number;
    rrfK: number;
  };
};

export type UpdateSearchRankingWeightsMutationVariables = Exact<{
  input: UpdateSearchRankingWeightsInput;
}>;

export type UpdateSearchRankingWeightsMutation = {
  updateSearchRankingWeights: {
    text: number;
    prefixBoost: number;
    soldCount: number;
    averageRating: number;
    reviewCount: number;
    personalizationCap: number;
    trigramFallbackThreshold: number;
    trigramMinSimilarity: number;
    rrfK: number;
  };
};

export type SearchSynonymsQueryVariables = Exact<{ [key: string]: never }>;

export type SearchSynonymsQuery = {
  searchSynonyms: Array<{
    id: string;
    terms: Array<string>;
    expansion: string;
    isActive: boolean;
    updatedAt: string;
  }>;
};

export type CreateSearchSynonymMutationVariables = Exact<{
  input: CreateSearchSynonymInput;
}>;

export type CreateSearchSynonymMutation = {
  createSearchSynonym: {
    id: string;
    terms: Array<string>;
    expansion: string;
    isActive: boolean;
    updatedAt: string;
  };
};

export type UpdateSearchSynonymMutationVariables = Exact<{
  id: string;
  input: UpdateSearchSynonymInput;
}>;

export type UpdateSearchSynonymMutation = {
  updateSearchSynonym: {
    id: string;
    terms: Array<string>;
    expansion: string;
    isActive: boolean;
    updatedAt: string;
  };
};

export type DeleteSearchSynonymMutationVariables = Exact<{
  id: string;
}>;

export type DeleteSearchSynonymMutation = { deleteSearchSynonym: boolean };

export type SearchAnalyticsSummaryQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
}>;

export type SearchAnalyticsSummaryQuery = {
  searchAnalyticsSummary: {
    totalSearches: number;
    uniqueQueries: number;
    zeroResultRate: number;
    avgResultsPerQuery: number;
    avgLatencyMs: number;
  };
};

export type SearchAnalyticsTopQueriesQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
  limit?: number | null | undefined;
}>;

export type SearchAnalyticsTopQueriesQuery = {
  searchAnalyticsTopQueries: Array<{ query: string; searchCount: number; avgResultCount: number }>;
};

export type SearchAnalyticsZeroResultQueriesQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
  limit?: number | null | undefined;
}>;

export type SearchAnalyticsZeroResultQueriesQuery = {
  searchAnalyticsZeroResultQueries: Array<{
    query: string;
    searchCount: number;
    avgResultCount: number;
  }>;
};

export type SearchAnalyticsSuggestionCtrQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
}>;

export type SearchAnalyticsSuggestionCtrQuery = {
  searchAnalyticsSuggestionCtr: Array<{
    prefixBucket: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
};

export type ExportSearchAnalyticsCsvQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
}>;

export type ExportSearchAnalyticsCsvQuery = { exportSearchAnalyticsCsv: string };

export type ApprovedCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedCategoriesQuery = {
  approvedCategories: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type ApprovedTagsQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedTagsQuery = {
  approvedTags: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type PendingCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type PendingCategoriesQuery = {
  pendingCategories: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type PendingTagsQueryVariables = Exact<{ [key: string]: never }>;

export type PendingTagsQuery = {
  pendingTags: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type MyCategoryProposalsQueryVariables = Exact<{ [key: string]: never }>;

export type MyCategoryProposalsQuery = {
  myCategoryProposals: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type MyTagProposalsQueryVariables = Exact<{ [key: string]: never }>;

export type MyTagProposalsQuery = {
  myTagProposals: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type CreateCategoryMutationVariables = Exact<{
  input: CreateCategoryInput;
}>;

export type CreateCategoryMutation = {
  createCategory: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type CreateTagMutationVariables = Exact<{
  input: CreateTagInput;
}>;

export type CreateTagMutation = {
  createTag: { id: string; name: string; slug: string; approvalStatus: string };
};

export type ApproveCategoryMutationVariables = Exact<{
  id: string;
}>;

export type ApproveCategoryMutation = {
  approveCategory: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type RejectCategoryMutationVariables = Exact<{
  id: string;
}>;

export type RejectCategoryMutation = {
  rejectCategory: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type ApproveTagMutationVariables = Exact<{
  id: string;
}>;

export type ApproveTagMutation = {
  approveTag: { id: string; name: string; slug: string; approvalStatus: string };
};

export type RejectTagMutationVariables = Exact<{
  id: string;
}>;

export type RejectTagMutation = {
  rejectTag: { id: string; name: string; slug: string; approvalStatus: string };
};

export type ApprovedPetTypesQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedPetTypesQuery = {
  approvedPetTypes: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type ApprovedBrandsQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedBrandsQuery = {
  approvedBrands: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type PendingPetTypesQueryVariables = Exact<{ [key: string]: never }>;

export type PendingPetTypesQuery = {
  pendingPetTypes: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type PendingBrandsQueryVariables = Exact<{ [key: string]: never }>;

export type PendingBrandsQuery = {
  pendingBrands: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type CreatePetTypeMutationVariables = Exact<{
  input: CreatePetTypeInput;
}>;

export type CreatePetTypeMutation = {
  createPetType: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type CreateBrandMutationVariables = Exact<{
  input: CreateBrandInput;
}>;

export type CreateBrandMutation = {
  createBrand: { id: string; name: string; slug: string; approvalStatus: string };
};

export type SetPetTypeImageMutationVariables = Exact<{
  input: SetPetTypeImageInput;
}>;

export type SetPetTypeImageMutation = {
  setPetTypeImage: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type ApprovePetTypeMutationVariables = Exact<{
  id: string;
}>;

export type ApprovePetTypeMutation = {
  approvePetType: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type RejectPetTypeMutationVariables = Exact<{
  id: string;
}>;

export type RejectPetTypeMutation = {
  rejectPetType: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type ApproveBrandMutationVariables = Exact<{
  id: string;
}>;

export type ApproveBrandMutation = {
  approveBrand: { id: string; name: string; slug: string; approvalStatus: string };
};

export type RejectBrandMutationVariables = Exact<{
  id: string;
}>;

export type RejectBrandMutation = {
  rejectBrand: { id: string; name: string; slug: string; approvalStatus: string };
};

export type CategoryDeleteImpactQueryVariables = Exact<{
  categoryId: string;
}>;

export type CategoryDeleteImpactQuery = {
  categoryDeleteImpact: {
    productCount: number;
    products: Array<{ id: string; name: string; slug: string }>;
  };
};

export type TagDeleteImpactQueryVariables = Exact<{
  tagId: string;
}>;

export type TagDeleteImpactQuery = {
  tagDeleteImpact: {
    productCount: number;
    products: Array<{ id: string; name: string; slug: string }>;
  };
};

export type PetTypeDeleteImpactQueryVariables = Exact<{
  petTypeId: string;
}>;

export type PetTypeDeleteImpactQuery = {
  petTypeDeleteImpact: {
    productCount: number;
    products: Array<{ id: string; name: string; slug: string }>;
  };
};

export type BrandDeleteImpactQueryVariables = Exact<{
  brandId: string;
}>;

export type BrandDeleteImpactQuery = {
  brandDeleteImpact: {
    productCount: number;
    products: Array<{ id: string; name: string; slug: string }>;
  };
};

export type RejectedCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type RejectedCategoriesQuery = {
  rejectedCategories: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type RejectedTagsQueryVariables = Exact<{ [key: string]: never }>;

export type RejectedTagsQuery = {
  rejectedTags: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type SetCategoryImageMutationVariables = Exact<{
  input: SetCategoryImageInput;
}>;

export type SetCategoryImageMutation = {
  setCategoryImage: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type UpdateCategoryMutationVariables = Exact<{
  input: UpdateCategoryInput;
}>;

export type UpdateCategoryMutation = {
  updateCategory: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type UpdatePetTypeMutationVariables = Exact<{
  input: UpdatePetTypeInput;
}>;

export type UpdatePetTypeMutation = {
  updatePetType: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type DeleteCategoryMutationVariables = Exact<{
  input: DeleteTaxonomyInput;
}>;

export type DeleteCategoryMutation = {
  deleteCategory: {
    success: boolean;
    deletedId: string;
    detachedProductCount: number;
    notifiedStoreCount: number;
    reassignedProductCount: number | null;
    replacementCategoryId: string | null;
  };
};

export type DeleteTagMutationVariables = Exact<{
  id: string;
}>;

export type DeleteTagMutation = {
  deleteTag: {
    success: boolean;
    deletedId: string;
    detachedProductCount: number;
    notifiedStoreCount: number;
  };
};

export type DeletePetTypeMutationVariables = Exact<{
  input: DeleteTaxonomyInput;
}>;

export type DeletePetTypeMutation = {
  deletePetType: {
    success: boolean;
    deletedId: string;
    detachedProductCount: number;
    notifiedStoreCount: number;
  };
};

export type DeleteBrandMutationVariables = Exact<{
  input: DeleteTaxonomyInput;
}>;

export type DeleteBrandMutation = {
  deleteBrand: {
    success: boolean;
    deletedId: string;
    detachedProductCount: number;
    notifiedStoreCount: number;
  };
};

export const PromotionFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PromotionFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PromotionType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'code' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scope' } },
          { kind: 'Field', name: { kind: 'Name', value: 'discountValue' } },
          { kind: 'Field', name: { kind: 'Name', value: 'minPurchaseAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDiscountAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usageLimit' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usagePerCustomer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usageCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
          { kind: 'Field', name: { kind: 'Name', value: 'autoApply' } },
          { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'startsAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PromotionFieldsFragment, unknown>;
export const NotificationsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Notifications' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'unreadOnly' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'notifications' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'unreadOnly' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'unreadOnly' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRead' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export const MarkNotificationReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkNotificationRead' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markNotificationRead' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkAllNotificationsRead' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'markAllNotificationsRead' } }],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkAllNotificationsReadMutation,
  MarkAllNotificationsReadMutationVariables
>;
export const UnreadNotificationsCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'UnreadNotificationsCount' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'unreadNotificationsCount' } }],
      },
    },
  ],
} as unknown as DocumentNode<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>;
export const StorePromotionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'StorePromotions' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storePromotions' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'storeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PromotionFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PromotionFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PromotionType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'code' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scope' } },
          { kind: 'Field', name: { kind: 'Name', value: 'discountValue' } },
          { kind: 'Field', name: { kind: 'Name', value: 'minPurchaseAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDiscountAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usageLimit' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usagePerCustomer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usageCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
          { kind: 'Field', name: { kind: 'Name', value: 'autoApply' } },
          { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'startsAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StorePromotionsQuery, StorePromotionsQueryVariables>;
export const SearchRankingWeightsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchRankingWeights' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchRankingWeights' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                { kind: 'Field', name: { kind: 'Name', value: 'prefixBoost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'soldCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'averageRating' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reviewCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'personalizationCap' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trigramFallbackThreshold' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trigramMinSimilarity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rrfK' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchRankingWeightsQuery, SearchRankingWeightsQueryVariables>;
export const UpdateSearchRankingWeightsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSearchRankingWeights' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateSearchRankingWeightsInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateSearchRankingWeights' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                { kind: 'Field', name: { kind: 'Name', value: 'prefixBoost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'soldCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'averageRating' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reviewCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'personalizationCap' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trigramFallbackThreshold' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trigramMinSimilarity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rrfK' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSearchRankingWeightsMutation,
  UpdateSearchRankingWeightsMutationVariables
>;
export const SearchSynonymsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchSynonyms' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchSynonyms' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'terms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expansion' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchSynonymsQuery, SearchSynonymsQueryVariables>;
export const CreateSearchSynonymDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateSearchSynonym' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateSearchSynonymInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createSearchSynonym' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'terms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expansion' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateSearchSynonymMutation, CreateSearchSynonymMutationVariables>;
export const UpdateSearchSynonymDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSearchSynonym' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateSearchSynonymInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateSearchSynonym' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'terms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expansion' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateSearchSynonymMutation, UpdateSearchSynonymMutationVariables>;
export const DeleteSearchSynonymDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteSearchSynonym' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteSearchSynonym' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteSearchSynonymMutation, DeleteSearchSynonymMutationVariables>;
export const SearchAnalyticsSummaryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchAnalyticsSummary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchAnalyticsSummary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'totalSearches' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uniqueQueries' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zeroResultRate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avgResultsPerQuery' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avgLatencyMs' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchAnalyticsSummaryQuery, SearchAnalyticsSummaryQueryVariables>;
export const SearchAnalyticsTopQueriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchAnalyticsTopQueries' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchAnalyticsTopQueries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'query' } },
                { kind: 'Field', name: { kind: 'Name', value: 'searchCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avgResultCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SearchAnalyticsTopQueriesQuery,
  SearchAnalyticsTopQueriesQueryVariables
>;
export const SearchAnalyticsZeroResultQueriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchAnalyticsZeroResultQueries' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchAnalyticsZeroResultQueries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'query' } },
                { kind: 'Field', name: { kind: 'Name', value: 'searchCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avgResultCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SearchAnalyticsZeroResultQueriesQuery,
  SearchAnalyticsZeroResultQueriesQueryVariables
>;
export const SearchAnalyticsSuggestionCtrDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchAnalyticsSuggestionCtr' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchAnalyticsSuggestionCtr' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'prefixBucket' } },
                { kind: 'Field', name: { kind: 'Name', value: 'impressions' } },
                { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'ctr' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SearchAnalyticsSuggestionCtrQuery,
  SearchAnalyticsSuggestionCtrQueryVariables
>;
export const ExportSearchAnalyticsCsvDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ExportSearchAnalyticsCsv' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'exportSearchAnalyticsCsv' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExportSearchAnalyticsCsvQuery, ExportSearchAnalyticsCsvQueryVariables>;
export const ApprovedCategoriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedCategories' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedCategories' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedCategoriesQuery, ApprovedCategoriesQueryVariables>;
export const ApprovedTagsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedTags' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedTags' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedTagsQuery, ApprovedTagsQueryVariables>;
export const PendingCategoriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PendingCategories' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pendingCategories' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PendingCategoriesQuery, PendingCategoriesQueryVariables>;
export const PendingTagsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PendingTags' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pendingTags' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PendingTagsQuery, PendingTagsQueryVariables>;
export const MyCategoryProposalsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyCategoryProposals' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myCategoryProposals' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyCategoryProposalsQuery, MyCategoryProposalsQueryVariables>;
export const MyTagProposalsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyTagProposals' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myTagProposals' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyTagProposalsQuery, MyTagProposalsQueryVariables>;
export const CreateCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateCategoryInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const CreateTagDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateTag' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateTagInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createTag' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateTagMutation, CreateTagMutationVariables>;
export const ApproveCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ApproveCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approveCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApproveCategoryMutation, ApproveCategoryMutationVariables>;
export const RejectCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RejectCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectCategoryMutation, RejectCategoryMutationVariables>;
export const ApproveTagDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ApproveTag' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approveTag' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApproveTagMutation, ApproveTagMutationVariables>;
export const RejectTagDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RejectTag' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectTag' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectTagMutation, RejectTagMutationVariables>;
export const ApprovedPetTypesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedPetTypes' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedPetTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedPetTypesQuery, ApprovedPetTypesQueryVariables>;
export const ApprovedBrandsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedBrands' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedBrands' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedBrandsQuery, ApprovedBrandsQueryVariables>;
export const PendingPetTypesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PendingPetTypes' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pendingPetTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PendingPetTypesQuery, PendingPetTypesQueryVariables>;
export const PendingBrandsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PendingBrands' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pendingBrands' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PendingBrandsQuery, PendingBrandsQueryVariables>;
export const CreatePetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreatePetTypeInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePetTypeMutation, CreatePetTypeMutationVariables>;
export const CreateBrandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateBrand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateBrandInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createBrand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateBrandMutation, CreateBrandMutationVariables>;
export const SetPetTypeImageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SetPetTypeImage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'SetPetTypeImageInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setPetTypeImage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetPetTypeImageMutation, SetPetTypeImageMutationVariables>;
export const ApprovePetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ApprovePetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvePetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovePetTypeMutation, ApprovePetTypeMutationVariables>;
export const RejectPetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RejectPetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectPetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectPetTypeMutation, RejectPetTypeMutationVariables>;
export const ApproveBrandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ApproveBrand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approveBrand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApproveBrandMutation, ApproveBrandMutationVariables>;
export const RejectBrandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RejectBrand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectBrand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectBrandMutation, RejectBrandMutationVariables>;
export const CategoryDeleteImpactDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CategoryDeleteImpact' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'categoryId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'categoryDeleteImpact' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'categoryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'categoryId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'productCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'products' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryDeleteImpactQuery, CategoryDeleteImpactQueryVariables>;
export const TagDeleteImpactDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'TagDeleteImpact' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'tagId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagDeleteImpact' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tagId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'tagId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'productCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'products' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TagDeleteImpactQuery, TagDeleteImpactQueryVariables>;
export const PetTypeDeleteImpactDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PetTypeDeleteImpact' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'petTypeId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'petTypeDeleteImpact' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'petTypeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'petTypeId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'productCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'products' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PetTypeDeleteImpactQuery, PetTypeDeleteImpactQueryVariables>;
export const BrandDeleteImpactDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'BrandDeleteImpact' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'brandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'brandDeleteImpact' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'brandId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'brandId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'productCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'products' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BrandDeleteImpactQuery, BrandDeleteImpactQueryVariables>;
export const RejectedCategoriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'RejectedCategories' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectedCategories' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectedCategoriesQuery, RejectedCategoriesQueryVariables>;
export const RejectedTagsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'RejectedTags' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectedTags' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectedTagsQuery, RejectedTagsQueryVariables>;
export const SetCategoryImageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SetCategoryImage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'SetCategoryImageInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setCategoryImage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCategoryImageMutation, SetCategoryImageMutationVariables>;
export const UpdateCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateCategoryInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const UpdatePetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdatePetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdatePetTypeInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updatePetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdatePetTypeMutation, UpdatePetTypeMutationVariables>;
export const DeleteCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'DeleteTaxonomyInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deletedId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'detachedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notifiedStoreCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reassignedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'replacementCategoryId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const DeleteTagDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteTag' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteTag' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deletedId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'detachedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notifiedStoreCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteTagMutation, DeleteTagMutationVariables>;
export const DeletePetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'DeleteTaxonomyInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deletedId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'detachedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notifiedStoreCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeletePetTypeMutation, DeletePetTypeMutationVariables>;
export const DeleteBrandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteBrand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'DeleteTaxonomyInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteBrand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deletedId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'detachedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notifiedStoreCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteBrandMutation, DeleteBrandMutationVariables>;
