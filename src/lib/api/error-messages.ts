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
  FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
  NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  BAD_REQUEST: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  VALIDATION_ERROR: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  CONFLICT: 'ข้อมูลนี้มีอยู่แล้วหรือขัดแย้งกับข้อมูลอื่น',
  DUPLICATE_NAME: 'มีชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น',
  SLUG_EXISTS: 'ชื่อย่อ (slug) นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น',
  PAYLOAD_TOO_LARGE: 'ไฟล์หรือข้อมูลมีขนาดใหญ่เกินไป',
  TOO_MANY_REQUESTS: 'มีการร้องขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่',
  INSUFFICIENT_STOCK: 'สินค้าไม่เพียงพอในสต็อก',
  RENDER_ERROR: 'เกิดข้อผิดพลาดในการแสดงผล กรุณาลองใหม่อีกครั้ง',
  STORE_SUSPENDED: 'ร้านค้านี้ถูกระงับชั่วคราว กรุณาส่งคำขอเปิดใช้งานใหม่หรือติดต่อฝ่ายสนับสนุน',
  PENDING_REACTIVATION_REQUEST_EXISTS: 'มีคำขอเปิดใช้งานร้านที่รออนุมัติอยู่แล้ว',
  PRODUCT_NOT_PUBLISHABLE: 'ยังไม่สามารถเผยแพร่สินค้าได้ กรุณาเติมข้อมูลให้ครบ',
  CATEGORY_IMAGE_REQUIRED: 'ต้องอัปโหลดรูปภาพหมวดหมู่ก่อนอนุมัติ',
  CATEGORY_HAS_PRODUCTS: 'หมวดหมู่นี้มีสินค้าที่ต้องย้าย — กรุณาเลือกหมวดหมู่ทดแทน',
  INVALID_REPLACEMENT_CATEGORY:
    'หมวดหมู่ทดแทนไม่ถูกต้อง — ต้องเป็นหมวดหมู่ที่อนุมัติแล้วและไม่ใช่หมวดหมู่ที่กำลังลบ',
  INVALID_CATEGORY_IMAGE_URL: 'URL รูปภาพไม่ถูกต้อง',
  CATEGORY_NOT_FOUND: 'ไม่พบหมวดหมู่',
  TAG_NOT_FOUND: 'ไม่พบแท็ก',
} as const;

export type ErrorMessageCode = keyof typeof ERROR_MESSAGES;

const ENVELOPE_FALLBACK = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

/**
 * Prefer API-provided copy for domain-specific codes (e.g. INVALID_OTP);
 * otherwise use the centralized Thai message for the code.
 */
export function messageForErrorCode(code: string, apiMessage?: string): string {
  if (apiMessage && apiMessage.trim() && !isOpaqueTechnicalMessage(apiMessage)) {
    return apiMessage;
  }
  return ERROR_MESSAGES[code as ErrorMessageCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

function isOpaqueTechnicalMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('response not successful') ||
    lower.includes('[object object]') ||
    lower.startsWith('request failed with status') ||
    lower.includes('internal server error') ||
    lower === 'network request failed'
  );
}

export function envelopeFallbackMessage(): string {
  return ENVELOPE_FALLBACK;
}
