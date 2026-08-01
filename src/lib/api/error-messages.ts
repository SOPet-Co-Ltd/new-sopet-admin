/** Central code → Thai user-facing copy for API/GraphQL errors. */
export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  INTERNAL_SERVER_ERROR: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
  GRAPHQL_ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  HTTP_ERROR: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
  NETWORK_ERROR: 'เชื่อมต่อไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่',
  TIMEOUT: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง',
  UNAUTHENTICATED: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
  UNAUTHORIZED: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
  SESSION_EXPIRED: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  INVALID_CREDENTIALS: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  ACCOUNT_SUSPENDED: 'บัญชีของคุณถูกระงับ กรุณาติดต่อฝ่ายสนับสนุน',
  FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
  STORE_MANAGER_REQUIRED: 'เฉพาะเจ้าของร้านหรือผู้จัดการเท่านั้นที่ดำเนินการนี้ได้',
  HOLD_TRANSITION_FORBIDDEN: 'ไม่สามารถดำเนินการได้ เนื่องจากรายการถูกระงับจากการระงับร้าน',
  HOLD_CANCEL_FORBIDDEN: 'ไม่สามารถยกเลิกได้ เนื่องจากรายการถูกระงับจากการระงับร้าน',
  INVALID_ROLE: 'บทบาทที่เลือกไม่ถูกต้อง',
  CANNOT_CHANGE_OWNER: 'ไม่สามารถเปลี่ยนบทบาทเจ้าของร้านได้',
  CANNOT_REMOVE_OWNER: 'ไม่สามารถลบเจ้าของร้านได้',
  NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  BAD_REQUEST: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  VALIDATION_ERROR: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  CONFLICT: 'ข้อมูลนี้มีอยู่แล้วหรือขัดแย้งกับข้อมูลอื่น',
  DUPLICATE_NAME: 'มีชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น',
  SLUG_EXISTS: 'ชื่อย่อ (slug) นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น',
  INVALID_SLUG: 'รูปแบบ slug ไม่ถูกต้อง',
  PAYLOAD_TOO_LARGE: 'ไฟล์หรือข้อมูลมีขนาดใหญ่เกินไป',
  TOO_MANY_REQUESTS: 'มีการร้องขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่',
  INSUFFICIENT_STOCK: 'สินค้าไม่เพียงพอในสต็อก',
  RENDER_ERROR: 'เกิดข้อผิดพลาดในการแสดงผล กรุณาลองใหม่อีกครั้ง',
  STORE_SUSPENDED: 'ร้านค้านี้ถูกระงับชั่วคราว กรุณาส่งคำขอเปิดใช้งานใหม่หรือติดต่อฝ่ายสนับสนุน',
  PENDING_REACTIVATION_REQUEST_EXISTS: 'มีคำขอเปิดใช้งานร้านที่รออนุมัติอยู่แล้ว',
  PRODUCT_NOT_PUBLISHABLE: 'ยังไม่สามารถเผยแพร่สินค้าได้ กรุณาเติมข้อมูลให้ครบ',
  EMAIL_NOT_VERIFIED:
    'กรุณายืนยันอีเมลก่อนขอเปิดร้านใหม่ ตรวจสอบกล่องจดหมายหรือกดส่งอีเมลยืนยันอีกครั้ง',
  EMAIL_ALREADY_VERIFIED: 'อีเมลได้รับการยืนยันแล้ว',
  CATEGORY_IMAGE_REQUIRED: 'ต้องอัปโหลดรูปภาพหมวดหมู่ก่อนอนุมัติ',
  CATEGORY_HAS_PRODUCTS: 'หมวดหมู่นี้มีสินค้าที่ต้องย้าย — กรุณาเลือกหมวดหมู่ทดแทน',
  INVALID_REPLACEMENT_CATEGORY:
    'หมวดหมู่ทดแทนไม่ถูกต้อง — ต้องเป็นหมวดหมู่ที่อนุมัติแล้วและไม่ใช่หมวดหมู่ที่กำลังลบ',
  INVALID_CATEGORY_IMAGE_URL: 'URL รูปภาพไม่ถูกต้อง',
  CATEGORY_NOT_FOUND: 'ไม่พบหมวดหมู่',
  TAG_NOT_FOUND: 'ไม่พบแท็ก',
  BRAND_NOT_FOUND: 'ไม่พบแบรนด์',
  VARIANT_REMOVAL_BLOCKED:
    'ไม่สามารถลบ SKU ได้ เพราะมีประวัติคำสั่งซื้อ และ/หรือ อยู่ในตะกร้าสินค้า',
} as const;

/** Role / permission failures that should always surface as a toast (row 26). */
export const PERMISSION_ERROR_CODES = new Set<string>([
  'FORBIDDEN',
  'STORE_MANAGER_REQUIRED',
  'HOLD_TRANSITION_FORBIDDEN',
  'HOLD_CANCEL_FORBIDDEN',
  'INVALID_ROLE',
  'CANNOT_CHANGE_OWNER',
  'CANNOT_REMOVE_OWNER',
  'STORE_SUSPENDED',
]);

export type ErrorMessageCode = keyof typeof ERROR_MESSAGES;

const ENVELOPE_FALLBACK = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

/**
 * Prefer localized (Thai) API copy for domain-specific codes (e.g. INVALID_OTP).
 * For known codes, never let English backend messages override the Thai map —
 * that was the user-visible gap for FORBIDDEN/role failures (row 26).
 */
export function messageForErrorCode(code: string, apiMessage?: string): string {
  const mapped = ERROR_MESSAGES[code as ErrorMessageCode];
  const trimmed = apiMessage?.trim();

  if (trimmed && !isOpaqueTechnicalMessage(trimmed)) {
    // Prefer API copy when it's already Thai, or when we have no Thai map for the code.
    if (!mapped || containsThai(trimmed)) {
      return trimmed;
    }
  }

  return mapped ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

export function isPermissionErrorCode(code: string): boolean {
  return PERMISSION_ERROR_CODES.has(code);
}

function containsThai(message: string): boolean {
  return /[\u0E00-\u0E7F]/.test(message);
}

function isOpaqueTechnicalMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('response not successful') ||
    lower.includes('[object object]') ||
    lower.startsWith('request failed with status') ||
    lower.includes('internal server error') ||
    lower === 'network request failed' ||
    lower === 'forbidden resource' ||
    lower === 'forbidden'
  );
}

export function envelopeFallbackMessage(): string {
  return ENVELOPE_FALLBACK;
}
