import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      user {
        id
        email
        fullName
        role
        storeId
        profilePhotoUrl
        emailVerified
      }
    }
  }
`;

export const VENDOR_LOGIN = gql`
  mutation VendorLogin($input: VendorLoginInput!) {
    vendorLogin(input: $input) {
      tokens {
        accessToken
        refreshToken
      }
      user {
        id
        email
        fullName
        role
        emailVerified
      }
    }
  }
`;

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($input: VendorLoginInput!) {
    adminLogin(input: $input) {
      tokens {
        accessToken
        refreshToken
      }
      user {
        id
        email
        fullName
        role
        emailVerified
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export const SWITCH_STORE = gql`
  mutation SwitchStore($input: SwitchStoreInput!) {
    switchStore(input: $input) {
      tokens {
        accessToken
        refreshToken
      }
      user {
        id
        email
        fullName
        role
        storeId
      }
    }
  }
`;

export const MY_STORES_QUERY = gql`
  query MyStores {
    myStores {
      membershipRole
      store {
        id
        name
        slug
        description
        logoUrl
        bannerUrl
        status
      }
    }
  }
`;

export const PENDING_STORES_QUERY = gql`
  query PendingStores {
    pendingStores {
      id
      name
      slug
      description
      logoUrl
      bannerUrl
      status
    }
  }
`;

export const APPROVE_STORE = gql`
  mutation ApproveStore($input: ApproveStoreInput!) {
    approveStore(input: $input) {
      id
      name
      slug
      status
    }
  }
`;

export const REJECT_STORE = gql`
  mutation RejectStore($input: RejectStoreInput!) {
    rejectStore(input: $input) {
      id
      name
      slug
      status
    }
  }
`;

export const VENDOR_ORDERS_QUERY = gql`
  query VendorOrders($storeId: String!) {
    vendorOrders(storeId: $storeId) {
      id
      orderNumber
      status
      createdAt
      subtotal
      shippingFee
      discountAmount
      total
      paymentMethod
      guestPhone
      guestName
      guestEmail
      items {
        id
        storeId
        productName
        unitPrice
        quantity
        subtotal
        fulfillmentStatus
        trackingNumber
        fulfillmentProvider
        trackingUrl
        variantOptions
      }
      storeShippings {
        storeId
        optionName
        shippingFee
      }
      shippingAddress {
        fullName
        phone
        addressLine1
        addressLine2
        tumbon
        amphoe
        province
        postalCode
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      id
      orderNumber
      status
    }
  }
`;

const VENDOR_ORDER_WORKFLOW_FIELDS = `
  id
  orderNumber
  status
  items {
    id
    storeId
    fulfillmentStatus
    trackingNumber
    fulfillmentProvider
    trackingUrl
  }
`;

export const MARK_VENDOR_ORDER_PAID = gql`
  mutation MarkVendorOrderPaid($orderId: String!) {
    markVendorOrderPaid(orderId: $orderId) {
      ${VENDOR_ORDER_WORKFLOW_FIELDS}
    }
  }
`;

export const ACKNOWLEDGE_VENDOR_ORDER = gql`
  mutation AcknowledgeVendorOrder($orderId: String!) {
    acknowledgeVendorOrder(orderId: $orderId) {
      ${VENDOR_ORDER_WORKFLOW_FIELDS}
    }
  }
`;

export const SHIP_VENDOR_ORDER = gql`
  mutation ShipVendorOrder($input: ShipVendorOrderInput!) {
    shipVendorOrder(input: $input) {
      ${VENDOR_ORDER_WORKFLOW_FIELDS}
    }
  }
`;

export const CANCEL_VENDOR_ORDER = gql`
  mutation CancelVendorOrder($orderId: String!) {
    cancelVendorOrder(orderId: $orderId) {
      ${VENDOR_ORDER_WORKFLOW_FIELDS}
    }
  }
`;

export const STORES_QUERY = gql`
  query Stores {
    stores {
      id
      name
      slug
      description
      logoUrl
      bannerUrl
      status
    }
  }
`;

export const STORE_QUERY = gql`
  query Store($id: String!) {
    store(id: $id) {
      id
      name
      slug
      description
      logoUrl
      bannerUrl
      status
    }
  }
`;

const PRODUCT_IMAGE_FIELDS = `
  id
  imageUrl
  sortOrder
  isThumbnail
`;

const PRODUCT_LIST_FIELDS = `
  id
  storeId
  name
  slug
  description
  basePrice
  warning
  expiryDate
  thumbnailUrl
  status
  category
  categoryId
  petTypeId
  brandId
  tags
  tagIds
  images {
    ${PRODUCT_IMAGE_FIELDS}
  }
  variants {
    id
    sku
    price
    stockQuantity
    optionsJson
  }
`;

export const PRODUCTS_QUERY = gql`
  query Products(
    $search: String
    $storeId: String
    $category: String
    $page: Int
    $limit: Int
  ) {
    products(search: $search, storeId: $storeId, category: $category, page: $page, limit: $limit) {
      items {
        ${PRODUCT_LIST_FIELDS}
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      storeId
      name
      slug
      description
      basePrice
      warning
      expiryDate
      thumbnailUrl
      status
      category
      categoryId
      petTypeId
      brandId
      tags
      tagIds
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      storeId
      name
      slug
      description
      basePrice
      warning
      expiryDate
      thumbnailUrl
      status
      category
  categoryId
  petTypeId
  brandId
  tags
  tagIds
      images {
        ${PRODUCT_IMAGE_FIELDS}
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id)
  }
`;

export const PRODUCT_QUERY = gql`
  query Product($id: String!) {
    vendorProduct(id: $id) {
      ${PRODUCT_LIST_FIELDS}
      averageRating
      reviewCount
      soldCount
      compareAtPrice
    }
  }
`;

export const PRODUCT_PUBLISH_CHECKLIST_QUERY = gql`
  query ProductPublishChecklist($productId: String!) {
    productPublishChecklist(productId: $productId) {
      canPublish
      missingKeys
      items {
        key
        complete
      }
    }
  }
`;

export const PUBLISH_PRODUCT = gql`
  mutation PublishProduct($id: String!) {
    publishProduct(id: $id) {
      id
      status
    }
  }
`;

export const VENDOR_PRODUCTS_QUERY = gql`
  query VendorProducts(
    $search: String
    $category: String
    $tag: String
    $petTypeIds: [String!]
    $brandIds: [String!]
    $page: Int
    $limit: Int
  ) {
    vendorProducts(
      search: $search
      category: $category
      tag: $tag
      petTypeIds: $petTypeIds
      brandIds: $brandIds
      page: $page
      limit: $limit
    ) {
      items {
        ${PRODUCT_LIST_FIELDS}
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const SYNC_PRODUCT_VARIANTS = gql`
  mutation SyncProductVariants($productId: String!, $variants: [SyncProductVariantItemInput!]!) {
    syncProductVariants(productId: $productId, variants: $variants) {
      id
      sku
      price
      stockQuantity
      optionsJson
    }
  }
`;

export const UPDATE_PRODUCT_VARIANT = gql`
  mutation UpdateProductVariant($variantId: String!, $input: UpdateProductVariantInput!) {
    updateProductVariant(variantId: $variantId, input: $input) {
      id
      sku
      price
      stockQuantity
      optionsJson
    }
  }
`;

export const PRODUCT_VARIANT_SYNC_IMPACT = gql`
  query ProductVariantSyncImpact($productId: String!, $variants: [SyncProductVariantItemInput!]!) {
    productVariantSyncImpact(productId: $productId, variants: $variants) {
      kept
      new
      removed
      blocked
      removedVariants {
        id
        sku
        optionKey
        optionsJson
        reasons
      }
    }
  }
`;

export const ADD_PRODUCT_IMAGE = gql`
  mutation AddProductImage($productId: String!, $input: AddProductImageInput!) {
    addProductImage(productId: $productId, input: $input) {
      ${PRODUCT_IMAGE_FIELDS}
    }
  }
`;

export const UPDATE_PRODUCT_IMAGE = gql`
  mutation UpdateProductImage($imageId: String!, $input: UpdateProductImageInput!) {
    updateProductImage(imageId: $imageId, input: $input) {
      ${PRODUCT_IMAGE_FIELDS}
    }
  }
`;

export const DELETE_PRODUCT_IMAGE = gql`
  mutation DeleteProductImage($imageId: String!) {
    deleteProductImage(imageId: $imageId)
  }
`;

export const SET_PRODUCT_THUMBNAIL = gql`
  mutation SetProductThumbnail($productId: String!, $imageId: String!) {
    setProductThumbnail(productId: $productId, imageId: $imageId) {
      ${PRODUCT_IMAGE_FIELDS}
    }
  }
`;

export const REORDER_PRODUCT_IMAGES = gql`
  mutation ReorderProductImages($productId: String!, $imageIds: [ID!]!) {
    reorderProductImages(productId: $productId, imageIds: $imageIds) {
      ${PRODUCT_IMAGE_FIELDS}
    }
  }
`;

export const STORE_ANALYTICS_QUERY = gql`
  query StoreAnalytics($storeId: String!, $fromDate: String, $toDate: String) {
    storeAnalytics(storeId: $storeId, fromDate: $fromDate, toDate: $toDate) {
      totalOrders
      totalRevenue
      totalProducts
      pendingOrders
      recentOrders
    }
  }
`;

export const PLATFORM_ANALYTICS_QUERY = gql`
  query PlatformAnalytics($fromDate: String, $toDate: String) {
    platformAnalytics(fromDate: $fromDate, toDate: $toDate) {
      totalOrders
      totalRevenue
      averageOrderValue
      totalStores
      pendingStores
      totalCustomers
    }
  }
`;

export const PLATFORM_SALES_OVER_TIME_QUERY = gql`
  query PlatformSalesOverTime($fromDate: String, $toDate: String) {
    platformSalesOverTime(fromDate: $fromDate, toDate: $toDate) {
      date
      revenue
      orderCount
    }
  }
`;

export const PLATFORM_SALES_BY_PAYMENT_QUERY = gql`
  query PlatformSalesByPaymentMethod($fromDate: String, $toDate: String) {
    platformSalesByPaymentMethod(fromDate: $fromDate, toDate: $toDate) {
      label
      revenue
      orderCount
    }
  }
`;

export const PLATFORM_SALES_BY_CATEGORY_QUERY = gql`
  query PlatformSalesByCategory($fromDate: String, $toDate: String, $limit: Int) {
    platformSalesByCategory(fromDate: $fromDate, toDate: $toDate, limit: $limit) {
      label
      revenue
      orderCount
    }
  }
`;

export const PLATFORM_TOP_PRODUCTS_QUERY = gql`
  query PlatformTopProducts($limit: Int) {
    platformTopProducts(limit: $limit) {
      productId
      name
      unitsSold
      revenue
    }
  }
`;

export const PLATFORM_TOP_STORES_QUERY = gql`
  query PlatformTopStores($limit: Int) {
    platformTopStores(limit: $limit) {
      storeId
      storeName
      revenue
      orderCount
    }
  }
`;

export const STORE_MEMBERS_QUERY = gql`
  query StoreMembers {
    storeMembers {
      id
      storeId
      userId
      role
      email
      fullName
    }
  }
`;

export const STORE_INVITATIONS_QUERY = gql`
  query StoreInvitations {
    storeInvitations {
      id
      storeId
      email
      role
      status
      expiresAt
    }
  }
`;

export const INVITE_STORE_MEMBER = gql`
  mutation InviteStoreMember($input: InviteStoreMemberInput!) {
    inviteStoreMember(input: $input) {
      id
      storeId
      email
      role
      status
      expiresAt
    }
  }
`;

export const UPDATE_STORE_MEMBER_ROLE = gql`
  mutation UpdateStoreMemberRole($input: UpdateStoreMemberRoleInput!) {
    updateStoreMemberRole(input: $input) {
      id
      storeId
      userId
      role
      email
      fullName
    }
  }
`;

export const REMOVE_STORE_MEMBER = gql`
  mutation RemoveStoreMember($memberId: String!) {
    removeStoreMember(memberId: $memberId)
  }
`;

export const REVOKE_STORE_INVITATION = gql`
  mutation RevokeStoreInvitation($invitationId: String!) {
    revokeStoreInvitation(invitationId: $invitationId) {
      id
      status
    }
  }
`;

export const ACCEPT_STORE_INVITATION = gql`
  mutation AcceptStoreInvitation($token: String!) {
    acceptStoreInvitation(token: $token) {
      id
      storeId
      userId
      role
      email
      fullName
    }
  }
`;

export const GET_STORE_INVITATION_BY_TOKEN = gql`
  query GetStoreInvitationByToken($token: String!) {
    getStoreInvitationByToken(token: $token) {
      storeName
      email
      role
      expiresAt
      userExists
    }
  }
`;

export const ACCEPT_STORE_MEMBER_INVITATION = gql`
  mutation AcceptStoreMemberInvitation($input: AcceptStoreMemberInvitationInput!) {
    acceptStoreMemberInvitation(input: $input) {
      tokens {
        accessToken
        refreshToken
      }
      user {
        id
        email
        fullName
        role
        emailVerified
      }
    }
  }
`;

export const STORE_DETAIL_QUERY = gql`
  query StoreDetail($id: String!) {
    store(id: $id) {
      id
      name
      slug
      description
      logoUrl
      bannerUrl
      status
      contactPhone
      contactEmail
      address
      bankAccountName
      bankAccountNumber
      bankName
    }
  }
`;

export const UPDATE_STORE = gql`
  mutation UpdateStore($input: UpdateStoreSettingsInput!) {
    updateStore(input: $input) {
      id
      name
      slug
      description
      logoUrl
      bannerUrl
      status
      contactPhone
      contactEmail
      address
    }
  }
`;

export const UPDATE_STORE_PAYOUT = gql`
  mutation UpdateStorePayout($input: UpdateStorePayoutInput!) {
    updateStorePayout(input: $input) {
      id
      bankAccountName
      bankAccountNumber
      bankName
      bankCode
      omiseRecipientId
      omiseRecipientStatus
      omiseRecipientFailureMessage
    }
  }
`;

export const MY_STORE_QUERY = gql`
  query MyStore {
    myStore {
      id
      name
      slug
      description
      logoUrl
      bannerUrl
      status
      contactPhone
      contactEmail
      address
      bankAccountName
      bankAccountNumber
      bankName
      bankCode
      omiseRecipientId
      omiseRecipientStatus
      omiseRecipientFailureMessage
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      email
      fullName
      role
      storeId
      profilePhotoUrl
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      message
    }
  }
`;

const PROMOTION_FIELDS = `
  id
  storeId
  code
  name
  description
  type
  scope
  discountValue
  minPurchaseAmount
  maxDiscountAmount
  usageLimit
  usagePerCustomer
  usageCount
  isActive
  autoApply
  priority
  conditions
  startsAt
  expiresAt
  createdAt
`;

export const PLATFORM_PROMOTIONS_QUERY = gql`
  query PlatformPromotions {
    platformPromotions {
      ${PROMOTION_FIELDS}
    }
  }
`;

export const CREATE_PROMOTION = gql`
  mutation CreatePromotion($input: CreatePromotionInput!) {
    createPromotion(input: $input) {
      ${PROMOTION_FIELDS}
    }
  }
`;

export const UPDATE_PROMOTION = gql`
  mutation UpdatePromotion($id: String!, $input: UpdatePromotionInput!) {
    updatePromotion(id: $id, input: $input) {
      ${PROMOTION_FIELDS}
    }
  }
`;

export const DELETE_PROMOTION = gql`
  mutation DeletePromotion($id: String!) {
    deletePromotion(id: $id)
  }
`;

export const TOGGLE_PROMOTION = gql`
  mutation TogglePromotion($id: String!, $isActive: Boolean!) {
    togglePromotion(id: $id, isActive: $isActive) {
      ${PROMOTION_FIELDS}
    }
  }
`;

export const REGISTER_VENDOR = gql`
  mutation RegisterVendor($input: RegisterVendorInput!) {
    registerVendor(input: $input) {
      tokens {
        accessToken
        refreshToken
      }
      user {
        id
        email
        fullName
        role
        emailVerified
      }
    }
  }
`;

const STORE_REQUEST_FIELDS = `
  id
  vendorUserId
  storeName
  description
  contactPhone
  contactEmail
  address
  logoUrl
  status
  rejectionReason
  createdStoreId
  createdAt
  updatedAt
`;

export const MY_STORE_REQUESTS_QUERY = gql`
  query MyStoreRequests {
    myStoreRequests {
      ${STORE_REQUEST_FIELDS}
    }
  }
`;

export const PENDING_STORE_REQUESTS_QUERY = gql`
  query PendingStoreRequests {
    pendingStoreRequests {
      ${STORE_REQUEST_FIELDS}
    }
  }
`;

export const SUBMIT_STORE_REQUEST = gql`
  mutation SubmitStoreRequest($input: SubmitStoreRequestInput!) {
    submitStoreRequest(input: $input) {
      ${STORE_REQUEST_FIELDS}
    }
  }
`;

export const APPROVE_STORE_REQUEST = gql`
  mutation ApproveStoreRequest($id: String!) {
    approveStoreRequest(id: $id) {
      ${STORE_REQUEST_FIELDS}
    }
  }
`;

export const REJECT_STORE_REQUEST = gql`
  mutation RejectStoreRequest($input: RejectStoreRequestInput!) {
    rejectStoreRequest(input: $input) {
      ${STORE_REQUEST_FIELDS}
    }
  }
`;

const STORE_REACTIVATION_REQUEST_FIELDS = `
  id
  storeId
  storeName
  submittedByUserId
  submittedByFullName
  submittedByEmail
  title
  content
  status
  reviewNote
  images {
    id
    imageUrl
    sortOrder
  }
  createdAt
  updatedAt
  reviewedAt
`;

export const STORE_REACTIVATION_REQUESTS_QUERY = gql`
  query StoreReactivationRequests($storeId: String!) {
    storeReactivationRequests(storeId: $storeId) {
      ${STORE_REACTIVATION_REQUEST_FIELDS}
    }
  }
`;

export const ADMIN_STORE_REACTIVATION_REQUESTS_QUERY = gql`
  query AdminStoreReactivationRequests($status: String) {
    adminStoreReactivationRequests(status: $status) {
      ${STORE_REACTIVATION_REQUEST_FIELDS}
    }
  }
`;

export const SUBMIT_STORE_REACTIVATION_REQUEST = gql`
  mutation SubmitStoreReactivationRequest($input: SubmitStoreReactivationRequestInput!) {
    submitStoreReactivationRequest(input: $input) {
      ${STORE_REACTIVATION_REQUEST_FIELDS}
    }
  }
`;

export const APPROVE_STORE_REACTIVATION_REQUEST = gql`
  mutation ApproveStoreReactivationRequest($id: String!) {
    approveStoreReactivationRequest(id: $id) {
      ${STORE_REACTIVATION_REQUEST_FIELDS}
    }
  }
`;

export const REJECT_STORE_REACTIVATION_REQUEST = gql`
  mutation RejectStoreReactivationRequest($input: RejectStoreReactivationRequestInput!) {
    rejectStoreReactivationRequest(input: $input) {
      ${STORE_REACTIVATION_REQUEST_FIELDS}
    }
  }
`;

const ADMIN_STORE_FIELDS = `
  id
  name
  slug
  description
  logoUrl
  bannerUrl
  status
  contactPhone
  contactEmail
  address
  ownerId
  ownerEmail
  ownerFullName
  createdAt
`;

export const ADMIN_STORES_QUERY = gql`
  query AdminStores {
    adminStores {
      ${ADMIN_STORE_FIELDS}
    }
  }
`;

export const ADMIN_STORE_QUERY = gql`
  query AdminStore($id: String!) {
    adminStore(id: $id) {
      ${ADMIN_STORE_FIELDS}
    }
  }
`;

export const CREATE_STORE_AS_ADMIN = gql`
  mutation CreateStoreAsAdmin($input: CreateStoreAsAdminInput!) {
    createStoreAsAdmin(input: $input) {
      ${ADMIN_STORE_FIELDS}
    }
  }
`;

export const UPDATE_STORE_AS_ADMIN = gql`
  mutation UpdateStoreAsAdmin($input: UpdateStoreAsAdminInput!) {
    updateStoreAsAdmin(input: $input) {
      ${ADMIN_STORE_FIELDS}
    }
  }
`;

const ADMIN_VENDOR_FIELDS = `
  id
  email
  fullName
  role
  isActive
  lastLoginAt
  createdAt
  stores {
    id
    name
    slug
    status
  }
`;

const ADMIN_VENDOR_INSIGHTS_FIELDS = `
  storeCount
  membershipCount
  totalRevenue
  orderCount
  averageOrderValue
  lastOrderAt
  lastActivityAt
  memberships {
    storeId
    storeName
    storeSlug
    storeStatus
    role
    joinedAt
  }
  activities {
    kind
    occurredAt
    storeId
    storeName
    orderNumber
  }
  recentOrders {
    id
    orderNumber
    status
    total
    createdAt
    items {
      productName
      quantity
      unitPrice
      subtotal
    }
  }
`;

export const ADMIN_VENDORS_QUERY = gql`
  query AdminVendors($search: String) {
    adminVendors(search: $search) {
      ${ADMIN_VENDOR_FIELDS}
    }
  }
`;

export const ADMIN_VENDOR_QUERY = gql`
  query AdminVendor($id: String!) {
    adminVendor(id: $id) {
      ${ADMIN_VENDOR_FIELDS}
    }
  }
`;

export const ADMIN_VENDOR_DETAIL_QUERY = gql`
  query AdminVendorDetail($id: String!) {
    adminVendorDetail(id: $id) {
      ${ADMIN_VENDOR_FIELDS}
      emailVerified
      insights {
        ${ADMIN_VENDOR_INSIGHTS_FIELDS}
      }
    }
  }
`;

export const UPDATE_VENDOR_AS_ADMIN = gql`
  mutation UpdateVendorAsAdmin($input: UpdateVendorAsAdminInput!) {
    updateVendorAsAdmin(input: $input) {
      ${ADMIN_VENDOR_FIELDS}
    }
  }
`;

export const ADMIN_TRIGGER_VENDOR_PASSWORD_RESET = gql`
  mutation AdminTriggerVendorPasswordReset($vendorId: String!) {
    adminTriggerVendorPasswordReset(vendorId: $vendorId) {
      message
    }
  }
`;

export const ADMIN_RESEND_VENDOR_EMAIL_VERIFICATION = gql`
  mutation AdminResendVendorEmailVerification($vendorId: String!) {
    adminResendVendorEmailVerification(vendorId: $vendorId) {
      message
    }
  }
`;

export const ADMIN_VERIFY_VENDOR_EMAIL = gql`
  mutation AdminVerifyVendorEmail($vendorId: String!) {
    adminVerifyVendorEmail(vendorId: $vendorId) {
      message
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) {
      message
    }
  }
`;

export const RESEND_EMAIL_VERIFICATION = gql`
  mutation ResendEmailVerification {
    resendEmailVerification {
      message
    }
  }
`;

export const INVITE_VENDOR = gql`
  mutation InviteVendor($input: InviteVendorInput!) {
    inviteVendor(input: $input) {
      id
      email
      status
      token
      expiresAt
    }
  }
`;

export const PENDING_VENDOR_INVITATIONS_QUERY = gql`
  query PendingVendorInvitations {
    pendingVendorInvitations {
      id
      email
      status
      token
      expiresAt
    }
  }
`;

export const ACCEPT_VENDOR_INVITATION = gql`
  mutation AcceptVendorInvitation($input: AcceptVendorInvitationInput!) {
    acceptVendorInvitation(input: $input) {
      tokens {
        accessToken
        refreshToken
      }
      user {
        id
        email
        fullName
        role
        emailVerified
      }
    }
  }
`;

export const STORE_PRODUCT_REVIEWS_QUERY = gql`
  query StoreProductReviews(
    $storeId: String!
    $page: Int
    $limit: Int
    $replyFilter: String
    $ratingFilter: String
  ) {
    storeProductReviews(
      storeId: $storeId
      page: $page
      limit: $limit
      replyFilter: $replyFilter
      ratingFilter: $ratingFilter
    ) {
      items {
        id
        productId
        productName
        productSlug
        productImageUrl
        rating
        comment
        createdAt
        customerName
        reply {
          id
          body
          createdAt
          updatedAt
        }
        images {
          id
          url
        }
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const CREATE_REVIEW_REPLY_MUTATION = gql`
  mutation CreateReviewReply($input: CreateReviewReplyInput!) {
    createReviewReply(input: $input) {
      id
      body
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_REVIEW_REPLY_MUTATION = gql`
  mutation UpdateReviewReply($input: UpdateReviewReplyInput!) {
    updateReviewReply(input: $input) {
      id
      body
      createdAt
      updatedAt
    }
  }
`;

export const STORE_REVIEW_SUMMARY_QUERY = gql`
  query StoreReviewSummary($storeId: String!) {
    storeReviewSummary(storeId: $storeId) {
      averageRating
      totalCount
      rating5Count
      rating4Count
      rating3Count
      rating2Count
      rating1Count
      productBreakdown {
        productId
        productName
        averageRating
        reviewCount
      }
    }
  }
`;

const SHIPPING_PROVIDER_FIELDS = `
  id
  name
  isActive
  createdAt
  updatedAt
`;

const STORE_SHIPPING_OPTION_FIELDS = `
  id
  storeId
  name
  description
  price
  sortOrder
  isActive
  providerId
`;

export const SHIPPING_PROVIDERS_QUERY = gql`
  query ShippingProviders($includeInactive: Boolean) {
    shippingProviders(includeInactive: $includeInactive) {
      ${SHIPPING_PROVIDER_FIELDS}
    }
  }
`;

export const MY_STORE_SHIPPING_OPTIONS_QUERY = gql`
  query MyStoreShippingOptions {
    myStoreShippingOptions {
      ${STORE_SHIPPING_OPTION_FIELDS}
    }
  }
`;

export const ADMIN_STORE_SHIPPING_OPTIONS_QUERY = gql`
  query AdminStoreShippingOptions($storeId: String!) {
    adminStoreShippingOptions(storeId: $storeId) {
      ${STORE_SHIPPING_OPTION_FIELDS}
    }
  }
`;

export const CREATE_SHIPPING_PROVIDER = gql`
  mutation CreateShippingProvider($input: CreateShippingProviderInput!) {
    createShippingProvider(input: $input) {
      ${SHIPPING_PROVIDER_FIELDS}
    }
  }
`;

export const UPDATE_SHIPPING_PROVIDER = gql`
  mutation UpdateShippingProvider($id: String!, $input: UpdateShippingProviderInput!) {
    updateShippingProvider(id: $id, input: $input) {
      ${SHIPPING_PROVIDER_FIELDS}
    }
  }
`;

export const DELETE_SHIPPING_PROVIDER = gql`
  mutation DeleteShippingProvider($id: String!) {
    deleteShippingProvider(id: $id)
  }
`;

export const CREATE_SHIPPING_OPTION = gql`
  mutation CreateShippingOption($input: CreateShippingOptionInput!) {
    createShippingOption(input: $input) {
      ${STORE_SHIPPING_OPTION_FIELDS}
    }
  }
`;

export const UPDATE_SHIPPING_OPTION = gql`
  mutation UpdateShippingOption($id: String!, $input: UpdateShippingOptionInput!) {
    updateShippingOption(id: $id, input: $input) {
      ${STORE_SHIPPING_OPTION_FIELDS}
    }
  }
`;

export const DELETE_SHIPPING_OPTION = gql`
  mutation DeleteShippingOption($id: String!) {
    deleteShippingOption(id: $id)
  }
`;

export const ADMIN_CREATE_STORE_SHIPPING_OPTION = gql`
  mutation AdminCreateStoreShippingOption(
    $storeId: String!
    $input: CreateShippingOptionInput!
  ) {
    adminCreateStoreShippingOption(storeId: $storeId, input: $input) {
      ${STORE_SHIPPING_OPTION_FIELDS}
    }
  }
`;

export const ADMIN_UPDATE_STORE_SHIPPING_OPTION = gql`
  mutation AdminUpdateStoreShippingOption(
    $id: String!
    $input: UpdateShippingOptionInput!
  ) {
    adminUpdateStoreShippingOption(id: $id, input: $input) {
      ${STORE_SHIPPING_OPTION_FIELDS}
    }
  }
`;

export const ADMIN_DELETE_STORE_SHIPPING_OPTION = gql`
  mutation AdminDeleteStoreShippingOption($id: String!) {
    adminDeleteStoreShippingOption(id: $id)
  }
`;

const PLATFORM_BANNER_FIELDS = `
  id
  title
  imageUrl
  mobileImageUrl
  linkUrl
  sortOrder
  isActive
  startsAt
  endsAt
`;

export const ALL_PLATFORM_BANNERS_QUERY = gql`
  query AllPlatformBanners {
    allPlatformBanners {
      ${PLATFORM_BANNER_FIELDS}
    }
  }
`;

export const CREATE_PLATFORM_BANNER = gql`
  mutation CreatePlatformBanner($input: CreatePlatformBannerInput!) {
    createPlatformBanner(input: $input) {
      ${PLATFORM_BANNER_FIELDS}
    }
  }
`;

export const UPDATE_PLATFORM_BANNER = gql`
  mutation UpdatePlatformBanner($input: UpdatePlatformBannerInput!) {
    updatePlatformBanner(input: $input) {
      ${PLATFORM_BANNER_FIELDS}
    }
  }
`;

export const DELETE_PLATFORM_BANNER = gql`
  mutation DeletePlatformBanner($id: String!) {
    deletePlatformBanner(id: $id)
  }
`;

export const REORDER_PLATFORM_BANNERS = gql`
  mutation ReorderPlatformBanners($ids: [ID!]!) {
    reorderPlatformBanners(ids: $ids) {
      ${PLATFORM_BANNER_FIELDS}
    }
  }
`;

const PLATFORM_SPONSOR_FIELDS = `
  id
  name
  imageUrl
  linkUrl
  sortOrder
  isActive
  startsAt
  endsAt
`;

export const ALL_PLATFORM_SPONSORS_QUERY = gql`
  query AllPlatformSponsors {
    allPlatformSponsors {
      ${PLATFORM_SPONSOR_FIELDS}
    }
  }
`;

export const CREATE_PLATFORM_SPONSOR = gql`
  mutation CreatePlatformSponsor($input: CreatePlatformSponsorInput!) {
    createPlatformSponsor(input: $input) {
      ${PLATFORM_SPONSOR_FIELDS}
    }
  }
`;

export const UPDATE_PLATFORM_SPONSOR = gql`
  mutation UpdatePlatformSponsor($input: UpdatePlatformSponsorInput!) {
    updatePlatformSponsor(input: $input) {
      ${PLATFORM_SPONSOR_FIELDS}
    }
  }
`;

export const DELETE_PLATFORM_SPONSOR = gql`
  mutation DeletePlatformSponsor($id: String!) {
    deletePlatformSponsor(id: $id)
  }
`;

export const REORDER_PLATFORM_SPONSORS = gql`
  mutation ReorderPlatformSponsors($ids: [ID!]!) {
    reorderPlatformSponsors(ids: $ids) {
      ${PLATFORM_SPONSOR_FIELDS}
    }
  }
`;

const PLATFORM_AD_FIELDS = `
  id
  title
  imageUrl
  linkUrl
  sortOrder
  isActive
  startsAt
  endsAt
`;

export const ALL_PLATFORM_ADS_QUERY = gql`
  query AllPlatformAds {
    allPlatformAds {
      ${PLATFORM_AD_FIELDS}
    }
  }
`;

export const CREATE_PLATFORM_AD = gql`
  mutation CreatePlatformAd($input: CreatePlatformAdInput!) {
    createPlatformAd(input: $input) {
      ${PLATFORM_AD_FIELDS}
    }
  }
`;

export const UPDATE_PLATFORM_AD = gql`
  mutation UpdatePlatformAd($input: UpdatePlatformAdInput!) {
    updatePlatformAd(input: $input) {
      ${PLATFORM_AD_FIELDS}
    }
  }
`;

export const DELETE_PLATFORM_AD = gql`
  mutation DeletePlatformAd($id: String!) {
    deletePlatformAd(id: $id)
  }
`;

const LOGIN_PAGE_IMAGES_FIELDS = `
  desktopImageUrl
  mobileImageUrl
  altText
`;

export const LOGIN_PAGE_IMAGES_QUERY = gql`
  query LoginPageImages {
    loginPageImages {
      ${LOGIN_PAGE_IMAGES_FIELDS}
    }
  }
`;

export const UPDATE_LOGIN_PAGE_IMAGES = gql`
  mutation UpdateLoginPageImages($input: UpdateLoginPageImagesInput!) {
    updateLoginPageImages(input: $input) {
      ${LOGIN_PAGE_IMAGES_FIELDS}
    }
  }
`;

export const CLEAR_LOGIN_PAGE_DESKTOP_IMAGE = gql`
  mutation ClearLoginPageDesktopImage {
    clearLoginPageDesktopImage {
      ${LOGIN_PAGE_IMAGES_FIELDS}
    }
  }
`;

export const CLEAR_LOGIN_PAGE_MOBILE_IMAGE = gql`
  mutation ClearLoginPageMobileImage {
    clearLoginPageMobileImage {
      ${LOGIN_PAGE_IMAGES_FIELDS}
    }
  }
`;

const ADMIN_TEAM_MEMBER_FIELDS = `
  id
  email
  fullName
  isActive
  createdAt
`;

const ADMIN_INVITATION_FIELDS = `
  id
  email
  status
  expiresAt
`;

export const ADMIN_TEAM_MEMBERS_QUERY = gql`
  query AdminTeamMembers {
    adminTeamMembers {
      ${ADMIN_TEAM_MEMBER_FIELDS}
    }
  }
`;

export const PENDING_ADMIN_INVITATIONS_QUERY = gql`
  query PendingAdminInvitations {
    pendingAdminInvitations {
      ${ADMIN_INVITATION_FIELDS}
    }
  }
`;

export const INVITE_ADMIN = gql`
  mutation InviteAdmin($input: InviteAdminInput!) {
    inviteAdmin(input: $input) {
      ${ADMIN_INVITATION_FIELDS}
    }
  }
`;

export const REVOKE_ADMIN_INVITATION = gql`
  mutation RevokeAdminInvitation($invitationId: String!) {
    revokeAdminInvitation(invitationId: $invitationId) {
      ${ADMIN_INVITATION_FIELDS}
    }
  }
`;

export const SET_ADMIN_ACTIVE = gql`
  mutation SetAdminActive($userId: String!, $isActive: Boolean!) {
    setAdminActive(userId: $userId, isActive: $isActive) {
      ${ADMIN_TEAM_MEMBER_FIELDS}
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      message
    }
  }
`;

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($base64: String!, $folder: String) {
    uploadImage(base64: $base64, folder: $folder) {
      url
      key
    }
  }
`;

const ADMIN_CUSTOMER_INSIGHTS_FIELDS = `
  totalSpent
  orderCount
  averageOrderValue
  lastOrderAt
  addressCount
  favoriteCount
  recentOrders {
    id
    orderNumber
    status
    total
    createdAt
    items {
      productName
      quantity
      unitPrice
      subtotal
    }
  }
`;

const ADMIN_CUSTOMER_FIELDS = `
  id
  phone
  fullName
  email
  dateOfBirth
  isVerified
  isActive
  lastLoginAt
  createdAt
  updatedAt
`;

const VENDOR_CUSTOMER_INSIGHTS_FIELDS = `
  totalSpent
  orderCount
  averageOrderValue
  lastOrderAt
  favoriteCount
  reviewCount
  recentOrders {
    id
    orderNumber
    status
    total
    createdAt
    items {
      productName
      quantity
      unitPrice
      subtotal
    }
  }
  recentReviews {
    id
    productName
    rating
    comment
    createdAt
  }
  favoriteProducts {
    productName
    createdAt
  }
`;

const VENDOR_CUSTOMER_FIELDS = `
  id
  phone
  fullName
  email
  isVerified
  lastLoginAt
  createdAt
`;

export const ADMIN_CUSTOMERS_QUERY = gql`
  query AdminCustomers($page: Int!, $limit: Int!, $search: String) {
    adminCustomers(page: $page, limit: $limit, search: $search) {
      items {
        ${ADMIN_CUSTOMER_FIELDS}
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const ADMIN_CUSTOMER_QUERY = gql`
  query AdminCustomer($id: String!) {
    adminCustomer(id: $id) {
      ${ADMIN_CUSTOMER_FIELDS}
    }
  }
`;

export const ADMIN_CUSTOMER_DETAIL_QUERY = gql`
  query AdminCustomerDetail($id: String!) {
    adminCustomerDetail(id: $id) {
      ${ADMIN_CUSTOMER_FIELDS}
      insights {
        ${ADMIN_CUSTOMER_INSIGHTS_FIELDS}
      }
    }
  }
`;

export const UPDATE_CUSTOMER_AS_ADMIN = gql`
  mutation UpdateCustomerAsAdmin($input: UpdateCustomerAsAdminInput!) {
    updateCustomerAsAdmin(input: $input) {
      ${ADMIN_CUSTOMER_FIELDS}
    }
  }
`;

export const SET_CUSTOMER_ACTIVE = gql`
  mutation SetCustomerActive($id: String!, $isActive: Boolean!) {
    setCustomerActive(id: $id, isActive: $isActive) {
      ${ADMIN_CUSTOMER_FIELDS}
    }
  }
`;

export const VENDOR_CUSTOMERS_QUERY = gql`
  query VendorCustomers($page: Int!, $limit: Int!, $search: String) {
    vendorCustomers(page: $page, limit: $limit, search: $search) {
      items {
        ${VENDOR_CUSTOMER_FIELDS}
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const VENDOR_CUSTOMER_QUERY = gql`
  query VendorCustomer($id: String!) {
    vendorCustomer(id: $id) {
      ${VENDOR_CUSTOMER_FIELDS}
    }
  }
`;

export const VENDOR_CUSTOMER_DETAIL_QUERY = gql`
  query VendorCustomerDetail($id: String!) {
    vendorCustomerDetail(id: $id) {
      ${VENDOR_CUSTOMER_FIELDS}
      insights {
        ${VENDOR_CUSTOMER_INSIGHTS_FIELDS}
      }
    }
  }
`;

export const STORE_API_KEYS_QUERY = gql`
  query StoreApiKeys($storeId: String!) {
    storeApiKeys(storeId: $storeId) {
      id
      name
      keyPrefix
      createdAt
      lastUsedAt
      revokedAt
    }
  }
`;

export const CREATE_STORE_API_KEY = gql`
  mutation CreateStoreApiKey($storeId: String!, $name: String!) {
    createStoreApiKey(storeId: $storeId, name: $name) {
      apiKey {
        id
        name
        keyPrefix
        createdAt
        lastUsedAt
      }
      secret
    }
  }
`;

export const REVOKE_STORE_API_KEY = gql`
  mutation RevokeStoreApiKey($storeId: String!, $id: String!) {
    revokeStoreApiKey(storeId: $storeId, id: $id)
  }
`;

// Notification operations
export const NOTIFICATIONS_QUERY = gql`
  query Notifications($unreadOnly: Boolean) {
    notifications(unreadOnly: $unreadOnly) {
      id
      type
      title
      message
      metadata
      isRead
      createdAt
    }
  }
`;

export const UNREAD_COUNT_QUERY = gql`
  query UnreadCount {
    unreadNotificationsCount
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: String!) {
    markNotificationRead(id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const SEARCH_RANKING_WEIGHTS_QUERY = gql`
  query SearchRankingWeights {
    searchRankingWeights {
      text
      prefixBoost
      soldCount
      averageRating
      reviewCount
      personalizationCap
      trigramFallbackThreshold
      trigramMinSimilarity
      rrfK
    }
  }
`;

export const UPDATE_SEARCH_RANKING_WEIGHTS = gql`
  mutation UpdateSearchRankingWeights($input: UpdateSearchRankingWeightsInput!) {
    updateSearchRankingWeights(input: $input) {
      text
      prefixBoost
      soldCount
      averageRating
      reviewCount
      personalizationCap
      trigramFallbackThreshold
      trigramMinSimilarity
      rrfK
    }
  }
`;

export const SEARCH_SYNONYMS_QUERY = gql`
  query SearchSynonyms {
    searchSynonyms {
      id
      terms
      expansion
      isActive
      updatedAt
    }
  }
`;

export const CREATE_SEARCH_SYNONYM = gql`
  mutation CreateSearchSynonym($input: CreateSearchSynonymInput!) {
    createSearchSynonym(input: $input) {
      id
      terms
      expansion
      isActive
      updatedAt
    }
  }
`;

export const UPDATE_SEARCH_SYNONYM = gql`
  mutation UpdateSearchSynonym($id: String!, $input: UpdateSearchSynonymInput!) {
    updateSearchSynonym(id: $id, input: $input) {
      id
      terms
      expansion
      isActive
      updatedAt
    }
  }
`;

export const DELETE_SEARCH_SYNONYM = gql`
  mutation DeleteSearchSynonym($id: String!) {
    deleteSearchSynonym(id: $id)
  }
`;

export const SEARCH_ANALYTICS_SUMMARY_QUERY = gql`
  query SearchAnalyticsSummary($fromDate: DateTime, $toDate: DateTime) {
    searchAnalyticsSummary(fromDate: $fromDate, toDate: $toDate) {
      totalSearches
      uniqueQueries
      zeroResultRate
      avgResultsPerQuery
      avgLatencyMs
    }
  }
`;

export const SEARCH_ANALYTICS_TOP_QUERIES_QUERY = gql`
  query SearchAnalyticsTopQueries($fromDate: DateTime, $toDate: DateTime, $limit: Int) {
    searchAnalyticsTopQueries(fromDate: $fromDate, toDate: $toDate, limit: $limit) {
      query
      searchCount
      avgResultCount
    }
  }
`;

export const SEARCH_ANALYTICS_ZERO_RESULT_QUERIES_QUERY = gql`
  query SearchAnalyticsZeroResultQueries($fromDate: DateTime, $toDate: DateTime, $limit: Int) {
    searchAnalyticsZeroResultQueries(fromDate: $fromDate, toDate: $toDate, limit: $limit) {
      query
      searchCount
      avgResultCount
    }
  }
`;

export const SEARCH_ANALYTICS_SUGGESTION_CTR_QUERY = gql`
  query SearchAnalyticsSuggestionCtr($fromDate: DateTime, $toDate: DateTime) {
    searchAnalyticsSuggestionCtr(fromDate: $fromDate, toDate: $toDate) {
      prefixBucket
      impressions
      clicks
      ctr
    }
  }
`;

export const EXPORT_SEARCH_ANALYTICS_CSV_QUERY = gql`
  query ExportSearchAnalyticsCsv($fromDate: DateTime, $toDate: DateTime) {
    exportSearchAnalyticsCsv(fromDate: $fromDate, toDate: $toDate)
  }
`;

export const PLATFORM_SETTINGS_FOR_VENDOR_QUERY = gql`
  query PlatformSettingsForVendor {
    platformSettings {
      storefrontUrl
    }
  }
`;

const PAYOUT_SUMMARY_FIELDS = `
  storeId
  grossRevenue
  totalPaidOut
  availableBalance
  pendingPayoutAmount
  minimumPayoutAmount
  canRequestPayout
`;

const PAYOUT_FIELDS = `
  id
  storeId
  amount
  netAmount
  status
  createdAt
`;

export const STORE_PAYOUT_SUMMARY_QUERY = gql`
  query StorePayoutSummary {
    storePayoutSummary {
      ${PAYOUT_SUMMARY_FIELDS}
    }
  }
`;

export const ADMIN_STORE_PAYOUT_SUMMARY_QUERY = gql`
  query AdminStorePayoutSummary($storeId: String!) {
    adminStorePayoutSummary(storeId: $storeId) {
      ${PAYOUT_SUMMARY_FIELDS}
    }
  }
`;

export const STORE_PAYOUTS_QUERY = gql`
  query StorePayouts {
    storePayouts {
      ${PAYOUT_FIELDS}
    }
  }
`;

export const ADMIN_STORE_PAYOUTS_QUERY = gql`
  query AdminStorePayouts($storeId: String!) {
    adminStorePayouts(storeId: $storeId) {
      ${PAYOUT_FIELDS}
    }
  }
`;

export const REQUEST_PAYOUT_MUTATION = gql`
  mutation RequestPayout {
    requestPayout {
      ${PAYOUT_FIELDS}
    }
  }
`;

export const TRIGGER_PAYOUT_MUTATION = gql`
  mutation TriggerPayout($input: TriggerPayoutInput!) {
    triggerPayout(input: $input) {
      ${PAYOUT_FIELDS}
    }
  }
`;

const ADMIN_AUDIT_LOG_FIELDS = `
  id
  actorType
  actorId
  actorLabel
  action
  resourceType
  resourceId
  metadata
  ipAddress
  createdAt
`;

export const ADMIN_AUDIT_LOGS_QUERY = gql`
  query AdminAuditLogs($page: Int!, $limit: Int!, $filter: AdminAuditLogFilterInput) {
    adminAuditLogs(page: $page, limit: $limit, filter: $filter) {
      items {
        ${ADMIN_AUDIT_LOG_FIELDS}
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;
