export const adminUser = {
  id: 'admin-e2e-1',
  email: 'admin-e2e@sopet.test',
  fullName: 'E2E Admin',
  role: 'admin' as const,
};

export const approvedCategories = [
  {
    id: 'cat-approved-1',
    name: 'อาหารสัตว์',
    slug: 'pet-food',
    approvalStatus: 'approved',
    imageUrl: 'https://cdn.example.com/categories/pet-food.webp',
    createdBy: 'admin-e2e-1',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const pendingCategories = [
  {
    id: 'cat-pending-1',
    name: 'ของเล่นสัตว์',
    slug: 'pet-toys',
    approvalStatus: 'pending',
    imageUrl: null,
    createdBy: 'admin-e2e-1',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

export const rejectedCategories = [
  {
    id: 'cat-rejected-1',
    name: 'หมวดที่ปฏิเสธ',
    slug: 'rejected-cat',
    approvalStatus: 'rejected',
    imageUrl: null,
    createdBy: 'vendor-1',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

export const approvedTags = [
  {
    id: 'tag-approved-1',
    name: 'ลดราคา',
    slug: 'sale',
    approvalStatus: 'approved',
    createdBy: 'admin-e2e-1',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const pendingTags = [
  {
    id: 'tag-pending-1',
    name: 'ใหม่',
    slug: 'new',
    approvalStatus: 'pending',
    createdBy: 'vendor-1',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

export const rejectedTags = [
  {
    id: 'tag-rejected-1',
    name: 'แท็กที่ปฏิเสธ',
    slug: 'rejected-tag',
    approvalStatus: 'rejected',
    createdBy: 'vendor-1',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

export const categoryDeleteImpact = {
  productCount: 3,
  products: [
    { id: 'prod-1', name: 'สินค้า A', slug: 'product-a' },
    { id: 'prod-2', name: 'สินค้า B', slug: 'product-b' },
    { id: 'prod-3', name: 'สินค้า C', slug: 'product-c' },
  ],
};

export const deleteCategoryResult = {
  success: true,
  deletedCategoryId: 'cat-delete-target',
  reassignedProductCount: 3,
  replacementCategoryId: 'cat-approved-1',
};
