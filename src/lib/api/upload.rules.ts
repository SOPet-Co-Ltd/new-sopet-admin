export const UPLOAD_FOLDERS = [
  'products',
  'stores',
  'reviews',
  'profiles',
  'banners',
  'sponsors',
  'ads',
  'categories',
  'pet-types',
  'login-images',
] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export interface AspectRatioRule {
  width: number;
  height: number;
  tolerance: number;
}

export interface FolderUploadRules {
  acceptedTypes: readonly string[];
  maxSizeBytes: number;
  aspectRatio?: AspectRatioRule;
  helperText: string;
  messages: {
    invalidType: string;
    tooLarge: string;
    invalidAspectRatio: string;
  };
}

const MB = 1024 * 1024;

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const ADS_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

const DEFAULT_RULES: FolderUploadRules = {
  acceptedTypes: DEFAULT_ACCEPTED_TYPES,
  maxSizeBytes: 5 * MB,
  helperText: 'JPEG, PNG, WebP หรือ GIF สูงสุด 5 MB',
  messages: {
    invalidType: 'รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG, WebP หรือ GIF',
    tooLarge: 'ขนาดไฟล์ต้องไม่เกิน 5 MB',
    invalidAspectRatio: 'อัตราส่วนรูปภาพไม่ถูกต้อง',
  },
};

export const FOLDER_UPLOAD_RULES: Record<UploadFolder, FolderUploadRules> = {
  products: DEFAULT_RULES,
  stores: DEFAULT_RULES,
  reviews: DEFAULT_RULES,
  profiles: DEFAULT_RULES,
  banners: DEFAULT_RULES,
  sponsors: DEFAULT_RULES,
  ads: {
    acceptedTypes: ADS_ACCEPTED_TYPES,
    maxSizeBytes: 1 * MB,
    aspectRatio: { width: 4, height: 5, tolerance: 0.02 },
    helperText: 'อัตราส่วน 4:5 (แนะนำ 1200×1500 px), สูงสุด 1 MB, รองรับ JPEG, PNG, WebP',
    messages: {
      invalidType: 'รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG หรือ WebP',
      tooLarge: 'ขนาดไฟล์ต้องไม่เกิน 1 MB',
      invalidAspectRatio: 'รูปภาพต้องมีอัตราส่วน 4:5 (แนวตั้ง)',
    },
  },
  categories: DEFAULT_RULES,
  'pet-types': DEFAULT_RULES,
  'login-images': DEFAULT_RULES,
};

export function getFolderUploadRules(folder: UploadFolder): FolderUploadRules {
  return FOLDER_UPLOAD_RULES[folder];
}

export function isAspectRatioWithinTolerance(
  width: number,
  height: number,
  rule: AspectRatioRule,
): boolean {
  const expected = rule.width / rule.height;
  const actual = width / height;
  return Math.abs(actual - expected) / expected <= rule.tolerance;
}
