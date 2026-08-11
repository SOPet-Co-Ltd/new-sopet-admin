import { z } from 'zod';

// Accepts Thai mobile (10 digits) and landline (9 digits) numbers, with optional
// spaces/dashes (e.g. "081-234-5678"). Rejects clearly non-phone input (emails, etc.)
// before it ever reaches the backend.
const THAI_PHONE_REGEX = /^0\d{8,9}$/;
const contactPhoneSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || THAI_PHONE_REGEX.test(value.replace(/[\s-]/g, '')),
    'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง',
  );

export const loginSchema = z.object({
  email: z.email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const productCreateSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  petTypeId: z.string().optional(),
  brandId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export type ProductCreateFormValues = z.infer<typeof productCreateSchema>;

export const profileFormSchema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อ'),
  email: z.email('กรุณากรอกอีเมลที่ถูกต้อง'),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const storeInfoFormSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อร้านค้า'),
  description: z.string().optional(),
  contactPhone: contactPhoneSchema,
  contactEmail: z.union([z.literal(''), z.email('กรุณากรอกอีเมลที่ถูกต้อง')]).optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

export type StoreInfoFormValues = z.infer<typeof storeInfoFormSchema>;

export const payoutFormSchema = z.object({
  bankCode: z.string().min(1, 'กรุณาเลือกธนาคาร'),
  bankAccountName: z.string().min(1, 'กรุณากรอกชื่อบัญชี'),
  bankAccountNumber: z.string().min(1, 'กรุณากรอกเลขที่บัญชี'),
});

export type PayoutFormValues = z.infer<typeof payoutFormSchema>;

export const inviteMemberSchema = z.object({
  email: z.email('กรุณากรอกอีเมลที่ถูกต้อง'),
  role: z.enum(['manager', 'staff']),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

export const proposeTaxonomySchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
});

export type ProposeTaxonomyFormValues = z.infer<typeof proposeTaxonomySchema>;

export const editTaxonomySchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  slug: z
    .string()
    .min(1, 'กรุณากรอก slug')
    .max(255, 'slug ยาวเกินไป')
    .regex(/^[\p{L}\p{N}\p{M}-]+$/u, 'slug ใช้ได้เฉพาะตัวอักษร ตัวเลข และขีดกลาง'),
});

export type EditTaxonomyFormValues = z.infer<typeof editTaxonomySchema>;

export const productImageFormSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().url('กรุณากรอก URL รูปภาพที่ถูกต้อง'),
  sortOrder: z.number().int().min(0),
  isThumbnail: z.boolean().optional(),
});

export type ProductImageFormValues = z.infer<typeof productImageFormSchema>;

export const productFormSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  description: z.string().optional(),
  basePrice: z.number().min(0, 'ราคาต้องไม่ต่ำกว่า 0').optional(),
  /** Original / strikethrough price for storefront discount % badge (not a coupon). */
  compareAtPrice: z.number().min(0, 'ราคาต้องไม่ต่ำกว่า 0').nullable().optional(),
  warning: z.string().optional(),
  expiryDate: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || !isNaN(Date.parse(v)),
      'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)',
    ),
  categoryId: z.string().optional(),
  petTypeId: z.string().optional(),
  brandId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  images: z.array(productImageFormSchema).optional(),
  newImageUrl: z
    .union([z.literal(''), z.string().url('กรุณากรอก URL รูปภาพที่ถูกต้อง')])
    .optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const registerVendorSchema = z
  .object({
    email: z.email('กรุณากรอกอีเมลที่ถูกต้อง'),
    password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
    // .trim() ensures a whitespace-only name (e.g. "   ") fails min(1) instead
    // of being accepted as a "valid" full name.
    fullName: z.string().trim().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  });

export type RegisterVendorFormValues = z.infer<typeof registerVendorSchema>;

export const acceptStoreMemberInviteSchema = z.object({
  fullName: z.string().trim().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
});

export type AcceptStoreMemberInviteFormValues = z.infer<typeof acceptStoreMemberInviteSchema>;

export const storeRequestSchema = z.object({
  storeName: z.string().min(1, 'กรุณากรอกชื่อร้านค้า'),
  description: z.string().optional(),
  contactPhone: contactPhoneSchema,
  contactEmail: z.union([z.literal(''), z.email('กรุณากรอกอีเมลที่ถูกต้อง')]).optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
});

export type StoreRequestFormValues = z.infer<typeof storeRequestSchema>;

export const storeReactivationRequestSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกหัวข้อ'),
  content: z.string().min(1, 'กรุณากรอกรายละเอียด'),
});

export type StoreReactivationRequestFormValues = z.infer<typeof storeReactivationRequestSchema>;

export {
  promotionFormSchema,
  type PromotionFormValues,
  getPromotionFormDefaults,
  buildPromotionConditions,
  parsePromotionConditions,
  assertPromotionType,
} from '@/lib/validations/promotions';

export const inviteVendorSchema = z.object({
  email: z.email('กรุณากรอกอีเมลที่ถูกต้อง'),
});

export type InviteVendorFormValues = z.infer<typeof inviteVendorSchema>;

export const adminStoreFormSchema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อร้านค้า'),
  slug: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  contactPhone: contactPhoneSchema,
  contactEmail: z.union([z.literal(''), z.email('กรุณากรอกอีเมลที่ถูกต้อง')]).optional(),
  address: z.string().optional(),
  ownerId: z.string().min(1, 'กรุณาเลือกเจ้าของร้านค้า'),
});

export type AdminStoreFormValues = z.infer<typeof adminStoreFormSchema>;

export const adminVendorFormSchema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อ'),
  email: z.email('กรุณากรอกอีเมลที่ถูกต้อง'),
});

export type AdminVendorFormValues = z.infer<typeof adminVendorFormSchema>;

export const adminCustomerFormSchema = z.object({
  fullName: z.string().optional(),
  email: z.union([z.literal(''), z.email('กรุณากรอกอีเมลที่ถูกต้อง')]).optional(),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
  dateOfBirth: z.string().optional(),
});

export type AdminCustomerFormValues = z.infer<typeof adminCustomerFormSchema>;

export const shippingOptionSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  description: z.string().optional(),
  price: z.number().min(0, 'ราคาต้องไม่ต่ำกว่า 0'),
  providerId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type ShippingOptionFormValues = z.infer<typeof shippingOptionSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('กรุณากรอกอีเมลที่ถูกต้อง'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const bannerFormSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อแบนเนอร์'),
  imageUrl: z.string().min(1, 'กรุณาอัปโหลดรูปภาพ').url('กรุณาอัปโหลดรูปภาพ'),
  mobileImageUrl: z.union([z.literal(''), z.string().url('กรุณาอัปโหลดรูปภาพ')]).optional(),
  linkUrl: z.union([z.literal(''), z.string().url('กรุณากรอก URL ที่ถูกต้อง')]).optional(),
  isActive: z.boolean().optional(),
});

export type BannerFormValues = z.infer<typeof bannerFormSchema>;

export const sponsorFormSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อสปอนเซอร์'),
  imageUrl: z.string().min(1, 'กรุณาอัปโหลดรูปภาพ').url('กรุณาอัปโหลดรูปภาพ'),
  linkUrl: z.union([z.literal(''), z.string().url('กรุณากรอก URL ที่ถูกต้อง')]).optional(),
  isActive: z.boolean().optional(),
});

export type SponsorFormValues = z.infer<typeof sponsorFormSchema>;

export const adFormSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อโฆษณา'),
  imageUrl: z.string().min(1, 'กรุณาอัปโหลดรูปภาพ').url('กรุณาอัปโหลดรูปภาพ'),
  linkUrl: z.union([z.literal(''), z.string().url('กรุณากรอก URL ที่ถูกต้อง')]).optional(),
  isActive: z.boolean().optional(),
});

export type AdFormValues = z.infer<typeof adFormSchema>;

export const inviteAdminSchema = z.object({
  email: z.email('กรุณากรอกอีเมลที่ถูกต้อง'),
});

export type InviteAdminFormValues = z.infer<typeof inviteAdminSchema>;

export const adminProfileFormSchema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อ'),
});

export type AdminProfileFormValues = z.infer<typeof adminProfileFormSchema>;

export const loginImagesFormSchema = z.object({
  desktopImageUrl: z.string().min(1, 'ต้องมีรูปเดสก์ท็อป'),
  mobileImageUrl: z.string(),
  altText: z.string().max(255, 'ข้อความ alt ต้องไม่เกิน 255 ตัวอักษร'),
});

export type LoginImagesFormValues = z.infer<typeof loginImagesFormSchema>;

export const bankTransferFormSchema = z.object({
  enabled: z.boolean(),
  bankName: z.string().trim().min(1, 'กรุณาเลือกธนาคาร').max(255),
  accountName: z.string().trim().min(1, 'ต้องระบุชื่อบัญชี').max(255),
  accountNumber: z
    .string()
    .trim()
    .min(1, 'ต้องระบุเลขบัญชี')
    .max(255)
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15;
    }, 'เลขบัญชีต้องมี 10–15 หลัก'),
});

export type BankTransferFormValues = z.infer<typeof bankTransferFormSchema>;
