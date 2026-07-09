import { z } from 'zod';

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
  contactPhone: z.string().optional(),
  contactEmail: z.union([z.literal(''), z.email('กรุณากรอกอีเมลที่ถูกต้อง')]).optional(),
  address: z.string().optional(),
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

export const registerVendorSchema = z.object({
  email: z.email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  fullName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
});

export type RegisterVendorFormValues = z.infer<typeof registerVendorSchema>;

export const storeRequestSchema = z.object({
  storeName: z.string().min(1, 'กรุณากรอกชื่อร้านค้า'),
  description: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.union([z.literal(''), z.email('กรุณากรอกอีเมลที่ถูกต้อง')]).optional(),
  address: z.string().optional(),
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
  name: z.string().min(1, 'กรุณากรอกชื่อร้านค้า'),
  slug: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.union([z.literal(''), z.email('กรุณากรอกอีเมลที่ถูกต้อง')]).optional(),
  address: z.string().optional(),
  ownerId: z.string().optional(),
  ownerEmail: z.union([z.literal(''), z.email('กรุณากรอกอีเมลที่ถูกต้อง')]).optional(),
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
