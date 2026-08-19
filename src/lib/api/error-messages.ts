/** Central code → Thai user-facing copy for API/GraphQL errors. */
export const ERROR_MESSAGES = {
  ACCOUNT_NOT_PENDING_DELETION: 'บัญชีนี้ไม่ได้อยู่ในสถานะรอการลบ',
  ACCOUNT_SUSPENDED: 'บัญชีของคุณถูกระงับ กรุณาติดต่อฝ่ายสนับสนุน',
  ADDRESS_NOT_FOUND: 'ไม่พบที่อยู่',
  ADMIN_NOT_FOUND: 'ไม่พบผู้ดูแลระบบ',
  AD_NOT_FOUND: 'ไม่พบโฆษณา',
  ALREADY_FAVORITED: 'สินค้านี้ถูกเพิ่มในรายการโปรดแล้ว',
  API_KEY_NOT_FOUND: 'ไม่พบคีย์ API',
  BAD_REQUEST: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  BANK_TRANSFER_ADMIN_ONLY: 'เฉพาะผู้ดูแลระบบเท่านั้นที่ยืนยันการโอนเงินได้',
  BANK_TRANSFER_FIELD_REQUIRED: 'กรุณากรอกข้อมูลการโอนเงินให้ครบ',
  BANK_TRANSFER_FIELD_TOO_LONG: 'ข้อมูลการโอนเงินยาวเกินไป',
  BANK_TRANSFER_NOT_CONFIGURED: 'ยังไม่ได้ตั้งค่าการโอนเงินเข้าบัญชี',
  BANNER_NOT_FOUND: 'ไม่พบบันเนอร์',
  BRAND_NOT_APPROVED: 'แบรนด์ยังไม่ได้รับการอนุมัติ',
  BRAND_NOT_FOUND: 'ไม่พบแบรนด์',
  CANNOT_CHANGE_OWNER: 'ไม่สามารถเปลี่ยนบทบาทเจ้าของร้านได้',
  CANNOT_REMOVE_OWNER: 'ไม่สามารถลบเจ้าของร้านได้',
  CARD_TOKEN_REQUIRED: 'ต้องระบุโทเค็นบัตร',
  CART_IDENTITY_REQUIRED: 'ต้องระบุตัวตนสำหรับตะกร้าสินค้า',
  CART_ITEM_NOT_FOUND: 'ไม่พบรายการในตะกร้า',
  CATEGORY_HAS_PRODUCTS: 'หมวดหมู่นี้มีสินค้าที่ต้องย้าย — กรุณาเลือกหมวดหมู่ทดแทน',
  CATEGORY_IMAGE_REQUIRED: 'ต้องอัปโหลดรูปภาพหมวดหมู่ก่อนอนุมัติ',
  CATEGORY_NOT_APPROVED: 'หมวดหมู่ยังไม่ได้รับการอนุมัติ',
  CATEGORY_NOT_FOUND: 'ไม่พบหมวดหมู่',
  CATEGORY_REPLACEMENT_INVALID:
    'หมวดหมู่ทดแทนไม่ถูกต้อง — ต้องเป็นหมวดหมู่ที่อนุมัติแล้วและไม่ใช่หมวดหมู่ที่กำลังลบ',
  CATEGORY_REPLACEMENT_REQUIRED: 'หมวดหมู่นี้มีสินค้าที่ต้องย้าย — กรุณาเลือกหมวดหมู่ทดแทน',
  COMMISSION_FORMULA_MISMATCH: 'สูตรค่าคอมมิชชันไม่ตรงกัน',
  CONFLICT: 'ข้อมูลนี้มีอยู่แล้วหรือขัดแย้งกับข้อมูลอื่น',
  CUSTOMER_NOT_FOUND: 'ไม่พบลูกค้า',
  CUSTOMER_PENDING_DELETION: 'บัญชีลูกค้าอยู่ระหว่างการลบ',
  CUSTOMER_REQUIRED: 'ต้องเข้าสู่ระบบด้วยบัญชีลูกค้า',
  CUSTOMER_SUSPENDED: 'บัญชีลูกค้าถูกระงับ',
  DELETION_ALREADY_REQUESTED: 'มีคำขอลบบัญชีอยู่แล้ว',
  DELETION_RETENTION_EXPIRED: 'หมดเวลารักษาข้อมูลหลังขอลบ',
  DUPLICATE_NAME: 'มีชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น',
  DUPLICATE_VARIANT_COMBINATION: 'ชุดตัวเลือกสินค้านี้ซ้ำกัน',
  DUPLICATE_VARIANT_GROUP: 'กลุ่มตัวเลือกสินค้านี้ซ้ำกัน',
  EMAIL_ALREADY_VERIFIED: 'อีเมลได้รับการยืนยันแล้ว',
  EMAIL_CONTAINER_SLOT_INVALID: 'ช่องคอนเทนเนอร์อีเมลไม่ถูกต้อง',
  EMAIL_DEFAULT_CONTAINER_REQUIRED: 'ต้องมีคอนเทนเนอร์อีเมลเริ่มต้น',
  EMAIL_EXISTS: 'อีเมลนี้ถูกใช้งานแล้ว',
  EMAIL_HTML_BLOCKED: 'พบ HTML ที่ไม่อนุญาตในเทมเพลตอีเมล',
  EMAIL_INVALID_VARIABLES_JSON: 'รูปแบบตัวแปรอีเมลไม่ถูกต้อง',
  EMAIL_MISMATCH: 'อีเมลไม่ตรงกัน',
  EMAIL_NOT_VERIFIED:
    'กรุณายืนยันอีเมลก่อนขอเปิดร้านใหม่ ตรวจสอบกล่องจดหมายหรือกดส่งอีเมลยืนยันอีกครั้ง',
  EMAIL_TAKEN: 'อีเมลนี้ถูกใช้งานแล้ว',
  EMAIL_TEMPLATE_NOT_FOUND: 'ไม่พบเทมเพลตอีเมล',
  EMAIL_TEST_SEND_FAILED: 'ส่งอีเมลทดสอบไม่สำเร็จ',
  EMAIL_UNKNOWN_PLACEHOLDERS: 'พบตัวแปรที่ไม่รู้จักในเทมเพลตอีเมล',
  FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
  FULFILLMENT_PROVIDER_REQUIRED: 'ต้องระบุผู้ให้บริการจัดส่ง',
  FULFILLMENT_PROVIDER_TOO_LONG: 'ชื่อผู้ให้บริการจัดส่งยาวเกินไป',
  GRAPHQL_ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  GUEST_PHONE_REQUIRED: 'ต้องระบุเบอร์โทรสำหรับลูกค้าทั่วไป',
  HOLD_CANCEL_FORBIDDEN: 'ไม่สามารถยกเลิกได้ เนื่องจากรายการถูกระงับจากการระงับร้าน',
  HOLD_RESTORE_SNAPSHOT_MISSING: 'ไม่พบข้อมูลสำหรับกู้คืนคำสั่งซื้อที่ถูกระงับ',
  HOLD_TRANSITION_FORBIDDEN: 'ไม่สามารถดำเนินการได้ เนื่องจากรายการถูกระงับจากการระงับร้าน',
  HTTP_ERROR: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
  IMAGE_NOT_FOUND: 'ไม่พบรูปภาพ',
  IMAGE_TOO_LARGE: 'ไฟล์รูปภาพมีขนาดใหญ่เกินไป',
  INSUFFICIENT_BALANCE: 'ยอดคงเหลือไม่เพียงพอ',
  INSUFFICIENT_STOCK: 'สินค้าไม่เพียงพอในสต็อก',
  INTERNAL_SERVER_ERROR: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
  INVALID_ADDRESS: 'ที่อยู่ไม่ถูกต้อง',
  INVALID_API_KEY: 'คีย์ API ไม่ถูกต้อง',
  INVALID_ASPECT_RATIO: 'สัดส่วนรูปภาพไม่ถูกต้อง',
  INVALID_AUDIT_EVENT: 'เหตุการณ์บันทึกการใช้งานไม่ถูกต้อง',
  INVALID_BASE64: 'ข้อมูล base64 ไม่ถูกต้อง',
  INVALID_BXGY_CONDITIONS: 'เงื่อนไขซื้อครบแถมไม่ถูกต้อง',
  INVALID_CATEGORY_IMAGE_URL: 'URL รูปภาพไม่ถูกต้อง',
  INVALID_COMMISSION_RATE: 'อัตราค่าคอมมิชชันไม่ถูกต้อง',
  INVALID_CONDITIONS: 'เงื่อนไขไม่ถูกต้อง',
  INVALID_CREDENTIALS: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  INVALID_DATE_OF_BIRTH: 'วันเกิดไม่ถูกต้อง',
  INVALID_DISCOUNT_VALUE: 'มูลค่าส่วนลดไม่ถูกต้อง',
  INVALID_FOLDER: 'โฟลเดอร์ไม่ถูกต้อง',
  INVALID_FULFILLMENT_STATE: 'สถานะการจัดส่งไม่ถูกต้อง',
  INVALID_IMAGE: 'รูปภาพไม่ถูกต้อง',
  INVALID_IMAGE_TYPE: 'ประเภทไฟล์รูปภาพไม่ถูกต้อง',
  INVALID_IMAGE_URL: 'URL รูปภาพไม่ถูกต้อง',
  INVALID_LOGGED_IN_ONLY_CONDITIONS: 'เงื่อนไขสำหรับสมาชิกที่เข้าสู่ระบบไม่ถูกต้อง',
  INVALID_NEW_CUSTOMER_CONDITIONS: 'เงื่อนไขลูกค้าใหม่ไม่ถูกต้อง',
  INVALID_ORDER_STATUS: 'สถานะคำสั่งซื้อไม่ถูกต้อง',
  INVALID_OTP: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ',
  INVALID_PASSWORD: 'รหัสผ่านไม่ถูกต้อง',
  INVALID_PAYOUT_AMOUNT: 'จำนวนเงินโอนออกไม่ถูกต้อง',
  INVALID_PHONE: 'เบอร์โทรไม่ถูกต้อง',
  INVALID_PROMOTION: 'โค้ดโปรโมชันไม่ถูกต้อง',
  INVALID_PROMOTION_DATE_RANGE: 'ช่วงวันที่โปรโมชันไม่ถูกต้อง',
  INVALID_RATING: 'คะแนนรีวิวไม่ถูกต้อง',
  INVALID_REACTIVATION_TOKEN: 'โทเค็นเปิดใช้งานใหม่ไม่ถูกต้อง',
  INVALID_REFRESH_TOKEN: 'โทเค็นรีเฟรชไม่ถูกต้อง',
  INVALID_REPLACEMENT_CATEGORY:
    'หมวดหมู่ทดแทนไม่ถูกต้อง — ต้องเป็นหมวดหมู่ที่อนุมัติแล้วและไม่ใช่หมวดหมู่ที่กำลังลบ',
  INVALID_REVIEW_STATUS: 'สถานะรีวิวไม่ถูกต้อง',
  INVALID_ROLE: 'บทบาทที่เลือกไม่ถูกต้อง',
  INVALID_SALE_CAMPAIGN_DATE_RANGE: 'ช่วงวันที่แคมเปญไม่ถูกต้อง',
  INVALID_SHIPPING_ADDRESS: 'ที่อยู่จัดส่งไม่ถูกต้อง',
  INVALID_SHIPPING_OPTION: 'ตัวเลือกการจัดส่งไม่ถูกต้อง',
  INVALID_SLUG: 'รูปแบบ slug ไม่ถูกต้อง',
  INVALID_STATUS: 'สถานะไม่ถูกต้อง',
  INVALID_TOKEN: 'โทเค็นไม่ถูกต้อง',
  INVALID_VALIDATE_PROMOTIONS_INPUT: 'ข้อมูลตรวจสอบโปรโมชันไม่ถูกต้อง',
  INVALID_VARIANT_OPTIONS: 'ตัวเลือกสินค้าไม่ถูกต้อง',
  INVALID_WEBHOOK_EVENT: 'เหตุการณ์ webhook ไม่ถูกต้อง',
  INVALID_WEBHOOK_URL: 'URL webhook ไม่ถูกต้อง',
  INVITATION_EXISTS: 'มีคำเชิญนี้อยู่แล้ว',
  INVITATION_EXPIRED: 'คำเชิญหมดอายุแล้ว',
  INVITATION_INVALID: 'คำเชิญไม่ถูกต้อง',
  INVITATION_NOT_FOUND: 'ไม่พบคำเชิญ',
  INVITATION_NOT_PENDING: 'คำเชิญไม่อยู่ในสถานะรอตอบรับ',
  LAST_ACTIVE_SHIPPING_OPTION: 'ไม่สามารถปิดใช้งานตัวเลือกการจัดส่งสุดท้ายที่ยังเปิดอยู่ได้',
  LAST_SHIPPING_OPTION: 'ไม่สามารถลบตัวเลือกการจัดส่งสุดท้ายได้',
  LOGIN_PAGE_IMAGES_ALT_TOO_LONG: 'ข้อความอธิบายรูปหน้าเข้าสู่ระบบยาวเกินไป',
  LOGIN_PAGE_IMAGES_DESKTOP_REQUIRED: 'ต้องอัปโหลดรูปหน้าเข้าสู่ระบบสำหรับเดสก์ท็อป',
  MEMBER_EXISTS: 'สมาชิกนี้มีอยู่ในทีมแล้ว',
  MEMBER_NOT_FOUND: 'ไม่พบสมาชิก',
  MISSING_LINES: 'ต้องระบุรายการสินค้า',
  MULTI_VENDOR_ORDER: 'คำสั่งซื้อมีหลายร้าน ไม่สามารถดำเนินการนี้ได้',
  NETWORK_ERROR: 'เชื่อมต่อไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่',
  NOTIFICATION_NOT_FOUND: 'ไม่พบการแจ้งเตือน',
  NOT_BANK_TRANSFER: 'คำสั่งซื้อนี้ไม่ใช่การโอนเงินเข้าบัญชี',
  NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  NO_ACTIVE_STORE: 'ไม่มีร้านค้าที่ใช้งานอยู่',
  NO_PENDING_MANUAL_PAYOUT: 'ไม่มีคำขอโอนเงินแบบ manual ที่รออยู่',
  NO_STORE_ITEMS: 'ไม่มีรายการสินค้าของร้านในคำสั่งซื้อนี้',
  NO_STORE_SELECTED: 'กรุณาเลือกร้านค้าก่อนดำเนินการ',
  OMISE_CARD_NOT_FOUND: 'ไม่พบบัตรในระบบชำระเงิน',
  OMISE_CUSTOMER_NOT_FOUND: 'ไม่พบลูกค้าในระบบชำระเงิน',
  OMISE_ERROR: 'เกิดข้อผิดพลาดจากระบบชำระเงิน',
  OMISE_NOT_CONFIGURED: 'ยังไม่ได้ตั้งค่าระบบชำระเงิน',
  OMISE_RECIPIENT_NOT_CONNECTED: 'ยังไม่ได้เชื่อมต่อบัญชีรับเงิน Omise',
  OMISE_RECIPIENT_NOT_READY: 'บัญชีรับเงิน Omise ยังไม่พร้อมใช้งาน',
  OMISE_TRANSFER_FAILED: 'โอนเงินผ่าน Omise ไม่สำเร็จ',
  ORDER_ALREADY_CANCELLED: 'คำสั่งซื้อนี้ถูกยกเลิกแล้ว',
  ORDER_CONTAINS_SUSPENDED_STORE: 'คำสั่งซื้อมีสินค้าจากร้านที่ถูกระงับ',
  ORDER_NOT_FOUND: 'ไม่พบคำสั่งซื้อ',
  ORDER_NOT_FULLY_SHIPPED: 'คำสั่งซื้อยังจัดส่งไม่ครบ',
  ORDER_NOT_PAYABLE: 'คำสั่งซื้อนี้ไม่สามารถชำระเงินได้',
  ORDER_NOT_REVIEWABLE: 'คำสั่งซื้อนี้ยังไม่สามารถรีวิวได้',
  OWNER_REQUIRED: 'ต้องระบุเจ้าของร้าน',
  PAYLOAD_TOO_LARGE: 'ไฟล์หรือข้อมูลมีขนาดใหญ่เกินไป',
  PAYMENT_HELD_PORTION_BLOCKED: 'ไม่สามารถชำระส่วนที่ถูกระงับได้',
  PAYMENT_METHOD_ALREADY_EXISTS: 'มีวิธีชำระเงินนี้อยู่แล้ว',
  PAYMENT_METHOD_NOT_FOUND: 'ไม่พบวิธีชำระเงิน',
  PAYMENT_NOT_CONFIRMABLE: 'ไม่สามารถยืนยันการชำระเงินได้',
  PAYMENT_NOT_FOUND: 'ไม่พบการชำระเงิน',
  PAYMENT_SUBSCRIPTION_TARGET_REQUIRED: 'ต้องระบุเป้าหมายการติดตามสถานะการชำระเงิน',
  PAYOUT_ALREADY_PENDING: 'มีคำขอโอนเงินที่รออยู่แล้ว',
  PAYOUT_BELOW_MINIMUM: 'จำนวนเงินโอนต่ำกว่าขั้นต่ำ',
  PAYOUT_MISMATCH: 'ข้อมูลการโอนเงินไม่ตรงกัน',
  PAYOUT_NOT_FOUND: 'ไม่พบรายการโอนเงิน',
  PAYOUT_NOT_PENDING: 'รายการโอนเงินไม่อยู่ในสถานะรอ',
  PAYOUT_WRONG_RAIL: 'ช่องทางโอนเงินไม่ถูกต้อง',
  PENDING_REACTIVATION_REQUEST_EXISTS: 'มีคำขอเปิดใช้งานร้านที่รออนุมัติอยู่แล้ว',
  PENDING_REQUEST_EXISTS: 'มีคำขอที่รออนุมัติอยู่แล้ว',
  PET_TYPE_NOT_APPROVED: 'ประเภทสัตว์เลี้ยงยังไม่ได้รับการอนุมัติ',
  PET_TYPE_NOT_FOUND: 'ไม่พบประเภทสัตว์เลี้ยง',
  PHONE_ALREADY_EXISTS: 'เบอร์โทรนี้ถูกใช้งานแล้ว',
  PHONE_UNCHANGED: 'เบอร์โทรไม่ได้เปลี่ยนแปลง',
  PRODUCT_NOT_FOUND: 'ไม่พบสินค้า',
  PRODUCT_NOT_IN_ORDER: 'สินค้าไม่อยู่ในคำสั่งซื้อนี้',
  PRODUCT_NOT_IN_STORE: 'สินค้าไม่อยู่ในร้านนี้',
  PRODUCT_NOT_PUBLISHABLE: 'ยังไม่สามารถเผยแพร่สินค้าได้ กรุณาเติมข้อมูลให้ครบ',
  PRODUCT_STORE_MISMATCH: 'สินค้าไม่ตรงกับร้าน',
  PROMOTION_CUSTOMER_LIMIT: 'ลูกค้าใช้โปรโมชันนี้ครบจำนวนครั้งแล้ว',
  PROMOTION_EXPIRED: 'โปรโมชันหมดอายุแล้ว',
  PROMOTION_LIMIT: 'โปรโมชันถูกใช้ครบจำนวนแล้ว',
  PROMOTION_MIN_PURCHASE: 'ยอดสั่งซื้อยังไม่ถึงขั้นต่ำของโปรโมชัน',
  PROMOTION_NOT_FOUND: 'ไม่พบโปรโมชัน',
  PROMOTION_NOT_STARTED: 'โปรโมชันยังไม่เริ่ม',
  PROMOTION_SCOPE: 'โปรโมชันใช้กับสินค้าหรือเงื่อนไขนี้ไม่ได้',
  PROMOTION_STORE: 'โปรโมชันนี้ใช้กับร้านนี้ไม่ได้',
  QUANTITY_TOO_LARGE: 'จำนวนสินค้ามากเกินไป',
  RATE_LIMIT_EXCEEDED: 'มีการร้องขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่',
  REACTIVATION_REQUEST_NOT_FOUND: 'ไม่พบคำขอเปิดใช้งานร้าน',
  RENDER_ERROR: 'เกิดข้อผิดพลาดในการแสดงผล กรุณาลองใหม่อีกครั้ง',
  REVIEW_ALREADY_EXISTS: 'มีรีวิวสำหรับรายการนี้อยู่แล้ว',
  REVIEW_NOT_APPROVED: 'รีวิวยังไม่ได้รับการอนุมัติ',
  REVIEW_NOT_FOUND: 'ไม่พบรีวิว',
  REVIEW_REPLY_ALREADY_EXISTS: 'มีการตอบรีวิวนี้อยู่แล้ว',
  REVIEW_REPLY_BODY_EMPTY: 'ข้อความตอบรีวิวว่างเปล่า',
  REVIEW_REPLY_BODY_INVALID: 'ข้อความตอบรีวิวไม่ถูกต้อง',
  REVIEW_REPLY_BODY_TOO_LONG: 'ข้อความตอบรีวิวยาวเกินไป',
  REVIEW_REPLY_NOT_FOUND: 'ไม่พบการตอบรีวิว',
  REVIEW_TOO_MANY_IMAGES: 'แนบรูปในรีวิวมากเกินไป',
  REVIEW_WINDOW_EXPIRED: 'หมดระยะเวลารีวิวแล้ว',
  SALE_CAMPAIGN_COMPARE_AT_INVALID: 'ราคาเปรียบเทียบของแคมเปญไม่ถูกต้อง',
  SALE_CAMPAIGN_ITEM_DISCOUNT_REQUIRED: 'ต้องระบุส่วนลดสำหรับรายการในแคมเปญ',
  SALE_CAMPAIGN_NOT_FOUND: 'ไม่พบแคมเปญ',
  SAVED_ADDRESS_NOT_FOUND: 'ไม่พบที่อยู่ที่บันทึกไว้',
  SAVED_ADDRESS_REQUIRES_LOGIN: 'ต้องเข้าสู่ระบบเพื่อใช้ที่อยู่ที่บันทึกไว้',
  SESSION_EXPIRED: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  SHIPPING_ADDRESS_REQUIRED: 'ต้องระบุที่อยู่จัดส่ง',
  SHIPPING_OPTION_NOT_FOUND: 'ไม่พบตัวเลือกการจัดส่ง',
  SHIPPING_OPTION_REQUIRED: 'ต้องเลือกตัวเลือกการจัดส่ง',
  SHIPPING_PROVIDER_NOT_FOUND: 'ไม่พบผู้ให้บริการจัดส่ง',
  SKU_EXISTS: 'รหัส SKU นี้ถูกใช้งานแล้ว',
  SLUG_EXISTS: 'ชื่อย่อ (slug) นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น',
  SMS_DELIVERY_FAILED: 'ส่ง SMS ไม่สำเร็จ',
  SMS_NOT_CONFIGURED: 'ยังไม่ได้ตั้งค่า SMS',
  SPONSOR_NOT_FOUND: 'ไม่พบสปอนเซอร์',
  STORAGE_NOT_CONFIGURED: 'ยังไม่ได้ตั้งค่าพื้นที่จัดเก็บไฟล์',
  STOREFRONT_URL_NOT_CONFIGURED: 'ยังไม่ได้ตั้งค่า URL ของหน้าร้าน',
  STORE_ACCESS_DENIED: 'คุณไม่มีสิทธิ์เข้าถึงร้านนี้',
  STORE_CONTEXT_REQUIRED: 'ต้องเลือกร้านค้าก่อนดำเนินการ',
  STORE_ID_REQUIRED: 'ต้องระบุรหัสร้านค้า',
  STORE_MANAGER_REQUIRED: 'เฉพาะเจ้าของร้านหรือผู้จัดการเท่านั้นที่ดำเนินการนี้ได้',
  STORE_NOT_FOUND: 'ไม่พบร้านค้า',
  STORE_NOT_SUSPENDED: 'ร้านค้านี้ไม่ได้ถูกระงับ',
  STORE_OWNER_REQUIRED: 'เฉพาะเจ้าของร้านเท่านั้นที่ดำเนินการนี้ได้',
  STORE_REQUEST_NOT_FOUND: 'ไม่พบคำขอเปิดร้าน',
  STORE_SUSPENDED: 'ร้านค้านี้ถูกระงับชั่วคราว กรุณาส่งคำขอเปิดใช้งานใหม่หรือติดต่อฝ่ายสนับสนุน',
  SUSPENDED_STORE_ITEM_REMOVED: 'ลบสินค้าจากร้านที่ถูกระงับออกจากตะกร้าแล้ว',
  TAG_NOT_APPROVED: 'แท็กยังไม่ได้รับการอนุมัติ',
  TAG_NOT_FOUND: 'ไม่พบแท็ก',
  TIMEOUT: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง',
  TOKEN_EXPIRED: 'โทเค็นหมดอายุแล้ว',
  TOO_MANY_ATTEMPTS: 'พยายามมากเกินไป กรุณารอสักครู่แล้วลองใหม่',
  TOO_MANY_IMAGES: 'จำนวนรูปภาพเกินที่อนุญาต',
  TOO_MANY_REQUESTS: 'มีการร้องขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่',
  TRACKING_NUMBER_REQUIRED: 'ต้องระบุหมายเลขพัสดุ',
  TRACKING_NUMBER_TOO_LONG: 'หมายเลขพัสดุยาวเกินไป',
  TRACKING_URL_INSECURE: 'URL ติดตามพัสดุต้องเป็น HTTPS',
  TRACKING_URL_INVALID: 'URL ติดตามพัสดุไม่ถูกต้อง',
  TRACKING_URL_REQUIRED: 'ต้องระบุ URL ติดตามพัสดุ',
  TRACKING_URL_TOO_LONG: 'URL ติดตามพัสดุยาวเกินไป',
  UNAUTHENTICATED: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
  UNAUTHORIZED: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
  UNKNOWN_ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  UPLOAD_FAILED: 'อัปโหลดไฟล์ไม่สำเร็จ',
  USER_NOT_FOUND: 'ไม่พบผู้ใช้',
  USE_CONFIRM_BANK_TRANSFER: 'กรุณายืนยันการโอนเงินผ่านขั้นตอนที่กำหนด',
  VALIDATION_ERROR: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  VARIANTS_REQUIRED: 'ต้องมีตัวเลือกสินค้าอย่างน้อยหนึ่งรายการ',
  VARIANT_ITEMS_REQUIRED: 'ต้องระบุรายการตัวเลือกสินค้า',
  VARIANT_NOT_FOUND: 'ไม่พบตัวเลือกสินค้า',
  VARIANT_NOT_ON_PRODUCT: 'ตัวเลือกสินค้าไม่อยู่ในสินค้านี้',
  VARIANT_REMOVAL_BLOCKED:
    'ไม่สามารถลบ SKU ได้ เพราะมีประวัติคำสั่งซื้อ และ/หรือ อยู่ในตะกร้าสินค้า',
  VARIANT_REQUIRED: 'ต้องระบุตัวเลือกสินค้า',
  VENDOR_NOT_FOUND: 'ไม่พบผู้ขาย',
  WEBHOOK_NOT_FOUND: 'ไม่พบ webhook',
} as const;

export type ErrorMessageCode = keyof typeof ERROR_MESSAGES;

export type ErrorCatalogEntry = {
  code: ErrorMessageCode;
  /** User-facing Thai meaning (same as ERROR_MESSAGES[code]). */
  message: string;
  group: string;
  /** Why / how this error occurs (Thai preferred). */
  why?: string;
  /** Possible underlying issue. */
  possibleIssue?: string;
  /** How to correct the problem. */
  howToFix?: string;
};

type ErrorCatalogDoc = Pick<ErrorCatalogEntry, 'why' | 'possibleIssue' | 'howToFix'>;

/**
 * Optional documentation for high-value admin/vendor codes.
 * Obscure codes stay message-only in the catalog.
 */
export const ERROR_CATALOG_DOCS: Partial<Record<ErrorMessageCode, ErrorCatalogDoc>> = {
  UNKNOWN_ERROR: {
    why: 'ระบบไม่สามารถระบุสาเหตุของข้อผิดพลาดได้ หรือรหัสไม่ได้อยู่ในแผนที่ข้อความ',
    possibleIssue: 'ข้อผิดพลาดเครือข่าย เซิร์ฟเวอร์ล่ม หรือรหัสใหม่ที่ยังไม่ได้แมป',
    howToFix: 'ลองใหม่ในภายหลัง หากเกิดซ้ำ ให้บันทึกรหัส/เวลาและติดต่อฝ่ายสนับสนุน',
  },
  INTERNAL_SERVER_ERROR: {
    why: 'เซิร์ฟเวอร์พบข้อผิดพลาดภายในขณะประมวลผลคำขอ',
    possibleIssue: 'บั๊กฝั่ง API หรือบริการที่เกี่ยวข้องล้มเหลวชั่วคราว',
    howToFix: 'ลองใหม่อีกครั้ง หากยังไม่หาย แจ้งทีมวิศวกรรมพร้อมเวลาและขั้นตอนที่ทำ',
  },
  NETWORK_ERROR: {
    why: 'เบราว์เซอร์เชื่อมต่อกับเซิร์ฟเวอร์ไม่ได้',
    possibleIssue: 'อินเทอร์เน็ตหลุด VPN หรือเซิร์ฟเวอร์หยุดทำงาน',
    howToFix: 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วโหลดหน้าใหม่',
  },
  TIMEOUT: {
    why: 'คำขอใช้เวลานานเกินกำหนด',
    possibleIssue: 'เครือข่ายช้า หรือเซิร์ฟเวอร์ตอบช้า',
    howToFix: 'ลองใหม่อีกครั้งเมื่อเครือข่ายเสถียรขึ้น',
  },
  BAD_REQUEST: {
    why: 'ข้อมูลที่ส่งไปไม่ถูกต้องตามที่ API คาดหวัง',
    possibleIssue: 'ฟอร์มไม่ครบ รูปแบบผิด หรือค่าที่ไม่อนุญาต',
    howToFix: 'ตรวจสอบข้อมูลที่กรอกแล้วลองส่งอีกครั้ง',
  },
  VALIDATION_ERROR: {
    why: 'การตรวจสอบความถูกต้องของข้อมูลล้มเหลว',
    possibleIssue: 'ช่องบังคับว่าง รูปแบบอีเมล/เบอร์ผิด หรือค่าเกินขอบเขต',
    howToFix: 'แก้ตามข้อความแจ้งเตือนในฟอร์มแล้วบันทึกใหม่',
  },
  NOT_FOUND: {
    why: 'ไม่พบทรัพยากรที่ร้องขอ',
    possibleIssue: 'รหัส/ลิงก์ผิด หรือถูกลบไปแล้ว',
    howToFix: 'ตรวจสอบว่ายังมีรายการนี้อยู่ แล้วรีเฟรชหน้ารายการ',
  },
  CONFLICT: {
    why: 'ข้อมูลขัดแย้งกับสถานะปัจจุบันในระบบ',
    possibleIssue: 'ชื่อซ้ำ หรือมีคนอื่นแก้ข้อมูลพร้อมกัน',
    howToFix: 'ใช้ชื่อ/ค่าที่ไม่ซ้ำ หรือรีเฟรชแล้วลองใหม่',
  },
  TOO_MANY_REQUESTS: {
    why: 'มีการร้องขอถี่เกินไป',
    possibleIssue: 'ถูกจำกัดอัตราการเรียก API',
    howToFix: 'รอสักครู่แล้วลองใหม่ หลีกเลี่ยงการกดซ้ำเร็วๆ',
  },
  RATE_LIMIT_EXCEEDED: {
    why: 'เกินขีดจำกัดการร้องขอในช่วงเวลาที่กำหนด',
    possibleIssue: 'ล็อกอิน/OTP หรือ API ถูกเรียกบ่อยเกินไป',
    howToFix: 'รอตามเวลาที่ระบบกำหนดแล้วลองใหม่',
  },
  UNAUTHENTICATED: {
    why: 'ยังไม่ได้เข้าสู่ระบบ หรือโทเค็นไม่ถูกส่งมา',
    possibleIssue: 'เซสชันหมดอายุ หรือคุกกี้ถูกลบ',
    howToFix: 'เข้าสู่ระบบใหม่แล้วลองดำเนินการอีกครั้ง',
  },
  UNAUTHORIZED: {
    why: 'ไม่มีสิทธิ์หรือไม่ได้ยืนยันตัวตนสำหรับคำขอนี้',
    possibleIssue: 'ไม่ได้ล็อกอิน หรือบทบาทไม่ถูกต้อง',
    howToFix: 'เข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์ที่เหมาะสม',
  },
  SESSION_EXPIRED: {
    why: 'เซสชันหมดอายุแล้ว',
    possibleIssue: 'ไม่ได้ใช้งานนาน หรือโทเค็นรีเฟรชใช้ไม่ได้',
    howToFix: 'เข้าสู่ระบบใหม่',
  },
  INVALID_CREDENTIALS: {
    why: 'อีเมลหรือรหัสผ่านไม่ตรงกับบัญชี',
    possibleIssue: 'พิมพ์ผิด ใช้บัญชีผิดพอร์ทัล หรือรหัสผ่านเปลี่ยนแล้ว',
    howToFix: 'ตรวจสอบอีเมล/รหัสผ่าน หรือใช้ลืมรหัสผ่าน',
  },
  INVALID_PASSWORD: {
    why: 'รหัสผ่านที่กรอกไม่ถูกต้อง',
    possibleIssue: 'พิมพ์ผิด หรือใช้รหัสผ่านเก่า',
    howToFix: 'ลองใหม่ หรือรีเซ็ตรหัสผ่าน',
  },
  INVALID_OTP: {
    why: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ',
    possibleIssue: 'กรอกรหัสผิด หรือขอรหัสใหม่แล้วใช้รหัสเก่า',
    howToFix: 'ขอ OTP ใหม่แล้วกรอกภายในเวลาที่กำหนด',
  },
  INVALID_TOKEN: {
    why: 'โทเค็นไม่ถูกต้องหรือถูกแก้ไข',
    possibleIssue: 'ลิงก์หมดอายุ คัดลอกไม่ครบ หรือใช้ไปแล้ว',
    howToFix: 'ขอลิงก์/โทเค็นใหม่จากขั้นตอนเดิม',
  },
  TOKEN_EXPIRED: {
    why: 'โทเค็นหมดอายุแล้ว',
    possibleIssue: 'เปิดลิงก์ช้าเกินไป',
    howToFix: 'ขอโทเค็นหรือลิงก์ใหม่',
  },
  INVALID_REFRESH_TOKEN: {
    why: 'โทเค็นรีเฟรชใช้ต่อเซสชันไม่ได้',
    possibleIssue: 'ออกจากระบบแล้ว หรือโทเค็นถูกเพิกถอน',
    howToFix: 'เข้าสู่ระบบใหม่',
  },
  TOO_MANY_ATTEMPTS: {
    why: 'พยายามดำเนินการเกินจำนวนครั้งที่อนุญาต',
    possibleIssue: 'ล็อกอินหรือใส่ OTP ผิดหลายครั้ง',
    howToFix: 'รอสักครู่แล้วลองใหม่',
  },
  ACCOUNT_SUSPENDED: {
    why: 'บัญชีถูกระงับโดยผู้ดูแลระบบ',
    possibleIssue: 'ละเมิดนโยบาย หรืออยู่ระหว่างตรวจสอบ',
    howToFix: 'ติดต่อฝ่ายสนับสนุนเพื่อขอให้ตรวจสอบสถานะบัญชี',
  },
  CUSTOMER_SUSPENDED: {
    why: 'บัญชีลูกค้าถูกระงับ',
    possibleIssue: 'ลูกค้าถูกระงับจากฝั่งแอดมิน',
    howToFix: 'ตรวจสอบสถานะลูกค้าในแอดมิน หรือติดต่อฝ่ายสนับสนุน',
  },
  FORBIDDEN: {
    why: 'บัญชีปัจจุบันไม่มีสิทธิ์ทำรายการนี้',
    possibleIssue: 'บทบาทไม่พอ หรือพยายามเข้าถึงร้าน/ทรัพยากรของผู้อื่น',
    howToFix: 'ใช้บัญชีที่มีสิทธิ์ หรือขอให้เจ้าของร้าน/แอดมินให้สิทธิ์',
  },
  STORE_MANAGER_REQUIRED: {
    why: 'ต้องเป็นเจ้าของร้านหรือผู้จัดการเท่านั้น',
    possibleIssue: 'ล็อกอินด้วยสมาชิกที่มีบทบาทต่ำกว่า',
    howToFix: 'ให้เจ้าของหรือผู้จัดการเป็นผู้ดำเนินการ หรือปรับบทบาทสมาชิก',
  },
  STORE_OWNER_REQUIRED: {
    why: 'ต้องเป็นเจ้าของร้านเท่านั้น',
    possibleIssue: 'ผู้จัดการหรือสมาชิกพยายามทำหน้าที่ของเจ้าของ',
    howToFix: 'ให้เจ้าของร้านเป็นผู้ดำเนินการ',
  },
  STORE_ACCESS_DENIED: {
    why: 'ไม่มีสิทธิ์เข้าถึงร้านนี้',
    possibleIssue: 'ไม่ได้เป็นสมาชิกร้าน หรือเลือกผิดร้าน',
    howToFix: 'เลือกร้านที่คุณเป็นสมาชิก หรือขอคำเชิญเข้าร้าน',
  },
  INVALID_ROLE: {
    why: 'บทบาทที่เลือกไม่ถูกต้องตามกฎของระบบ',
    possibleIssue: 'พยายามตั้งบทบาทที่ไม่อนุญาต เช่น เปลี่ยนเจ้าของผิดวิธี',
    howToFix: 'เลือกบทบาทที่ระบบรองรับสำหรับสมาชิกคนนั้น',
  },
  CANNOT_CHANGE_OWNER: {
    why: 'ไม่สามารถเปลี่ยนบทบาทของเจ้าของร้านได้โดยตรง',
    possibleIssue: 'พยายามลดสิทธิ์หรือเปลี่ยนบทบาทเจ้าของ',
    howToFix: 'ใช้ขั้นตอนโอนความเป็นเจ้าของที่ถูกต้อง (ถ้ามี) หรือติดต่อแอดมิน',
  },
  CANNOT_REMOVE_OWNER: {
    why: 'ไม่สามารถลบเจ้าของร้านออกจากทีมได้',
    possibleIssue: 'พยายามเอาเจ้าของออกจากสมาชิกร้าน',
    howToFix: 'โอนความเป็นเจ้าของก่อน แล้วจึงจัดการสมาชิก',
  },
  INVALID_API_KEY: {
    why: 'คีย์ API ไม่ถูกต้องหรือถูกเพิกถอน',
    possibleIssue: 'คัดลอกคีย์ผิด หรือสร้างคีย์ใหม่แล้วใช้คีย์เก่า',
    howToFix: 'สร้าง/คัดลอกคีย์ API ใหม่จากหน้าตั้งค่าแล้วอัปเดตการเรียก API',
  },
  API_KEY_NOT_FOUND: {
    why: 'ไม่พบคีย์ API ที่ระบุ',
    possibleIssue: 'คีย์ถูกลบแล้ว หรือรหัสคีย์ผิด',
    howToFix: 'ตรวจสอบรายการคีย์ในร้านแล้วใช้คีย์ที่ยังใช้งานได้',
  },
  STORE_NOT_FOUND: {
    why: 'ไม่พบร้านค้าตามรหัสที่ระบุ',
    possibleIssue: 'ร้านถูกลบ หรือใช้รหัสร้านผิด',
    howToFix: 'เลือกร้านจากรายการที่มีอยู่ หรือรีเฟรชหน้า',
  },
  STORE_SUSPENDED: {
    why: 'ร้านถูกระงับชั่วคราว จึงทำรายการขาย/จัดการบางอย่างไม่ได้',
    possibleIssue: 'แอดมินระงับร้าน หรืออยู่ระหว่างสอบสวน',
    howToFix: 'ส่งคำขอเปิดใช้งานใหม่ หรือติดต่อฝ่ายสนับสนุน',
  },
  STORE_NOT_SUSPENDED: {
    why: 'ร้านไม่ได้ถูกระงับ แต่พยายามทำรายการที่เกี่ยวกับการระงับ',
    possibleIssue: 'สถานะร้านเปลี่ยนไปแล้ว',
    howToFix: 'รีเฟรชสถานะร้านแล้วดำเนินการตามสถานะปัจจุบัน',
  },
  NO_ACTIVE_STORE: {
    why: 'ไม่มีร้านที่ใช้งานอยู่สำหรับบัญชีนี้',
    possibleIssue: 'ยังไม่ได้อนุมัติร้าน หรือร้านถูกปิด/ระงับทั้งหมด',
    howToFix: 'รอการอนุมัติร้าน หรือขอเปิดใช้งานร้านที่ถูกระงับ',
  },
  NO_STORE_SELECTED: {
    why: 'ยังไม่ได้เลือกร้านก่อนดำเนินการ',
    possibleIssue: 'สลับบริบทร้านหาย หรือเข้าหน้าโดยตรงโดยไม่เลือกร้าน',
    howToFix: 'เลือกร้านจากตัวสลับร้านแล้วลองใหม่',
  },
  STORE_CONTEXT_REQUIRED: {
    why: 'คำขอนี้ต้องระบุบริบทของร้าน',
    possibleIssue: 'ไม่ได้เลือกร้าน หรือ header/รหัสร้านหาย',
    howToFix: 'เลือกร้านที่ต้องการจัดการก่อนดำเนินการ',
  },
  STORE_ID_REQUIRED: {
    why: 'ต้องระบุรหัสร้านค้า',
    possibleIssue: 'คำขอขาด storeId',
    howToFix: 'เลือกร้านหรือระบุรหัสร้านให้ครบ',
  },
  PENDING_REQUEST_EXISTS: {
    why: 'มีคำขอที่รออนุมัติอยู่แล้ว',
    possibleIssue: 'ส่งคำขอซ้ำขณะที่คำขอเดิมยังไม่ถูกตัดสิน',
    howToFix: 'รอผลคำขอเดิม หรือยกเลิก/ติดตามสถานะที่มีอยู่',
  },
  PENDING_REACTIVATION_REQUEST_EXISTS: {
    why: 'มีคำขอเปิดใช้งานร้านที่รออนุมัติอยู่แล้ว',
    possibleIssue: 'ส่งคำขอเปิดใช้งานซ้ำ',
    howToFix: 'รอการพิจารณาคำขอเดิมจากแอดมิน',
  },
  REACTIVATION_REQUEST_NOT_FOUND: {
    why: 'ไม่พบคำขอเปิดใช้งานร้าน',
    possibleIssue: 'คำขอถูกลบหรือรหัสผิด',
    howToFix: 'รีเฟรชรายการคำขอแล้วเลือกจากรายการที่มี',
  },
  STORE_REQUEST_NOT_FOUND: {
    why: 'ไม่พบคำขอเปิดร้าน',
    possibleIssue: 'คำขอถูกตัดสินไปแล้วหรือรหัสผิด',
    howToFix: 'ตรวจสอบคิวคำขอเปิดร้านอีกครั้ง',
  },
  EMAIL_NOT_VERIFIED: {
    why: 'ยังไม่ได้ยืนยันอีเมลของบัญชี',
    possibleIssue: 'ยังไม่กดลิงก์ยืนยัน หรืออีเมลเข้าสแปม',
    howToFix: 'เปิดอีเมลแล้วยืนยัน หรือขอส่งอีเมลยืนยันอีกครั้ง',
  },
  CATEGORY_NOT_FOUND: {
    why: 'ไม่พบหมวดหมู่ที่ระบุ',
    possibleIssue: 'หมวดหมู่ถูกลบ หรือยังไม่ถูกสร้าง',
    howToFix: 'เลือกหมวดหมู่จากรายการที่อนุมัติแล้ว',
  },
  CATEGORY_NOT_APPROVED: {
    why: 'หมวดหมู่ยังไม่ได้รับการอนุมัติ',
    possibleIssue: 'ใช้หมวดหมู่ที่เสนอใหม่และยังรอแอดมินอนุมัติ',
    howToFix: 'รอการอนุมัติ หรือเลือกหมวดหมู่ที่อนุมัติแล้ว',
  },
  CATEGORY_IMAGE_REQUIRED: {
    why: 'ต้องมีรูปหมวดหมู่ก่อนอนุมัติ',
    possibleIssue: 'แอดมินพยายามอนุมัติโดยยังไม่มีรูป',
    howToFix: 'อัปโหลดรูปหมวดหมู่ให้ครบก่อนอนุมัติ',
  },
  CATEGORY_REPLACEMENT_REQUIRED: {
    why: 'หมวดหมู่มีสินค้าอยู่ จึงต้องระบุหมวดหมู่ทดแทนเมื่อลบ',
    possibleIssue: 'พยายามลบหมวดหมู่ที่มีสินค้าโดยไม่ระบุปลายทาง',
    howToFix: 'เลือกหมวดหมู่ทดแทนที่อนุมัติแล้วแล้วค่อยลบ',
  },
  CATEGORY_REPLACEMENT_INVALID: {
    why: 'หมวดหมู่ทดแทนไม่ผ่านเงื่อนไข',
    possibleIssue: 'เลือกหมวดหมู่ที่ยังไม่อนุมัติ หรือเลือกหมวดหมู่เดียวกับที่กำลังลบ',
    howToFix: 'เลือกหมวดหมู่ที่อนุมัติแล้วและไม่ใช่หมวดหมู่ที่กำลังลบ',
  },
  CATEGORY_HAS_PRODUCTS: {
    why: 'หมวดหมู่ยังมีสินค้าผูกอยู่',
    possibleIssue: 'ลบหมวดหมู่โดยยังไม่ย้ายสินค้า',
    howToFix: 'ย้ายสินค้าไปหมวดหมู่ทดแทนก่อนลบ',
  },
  TAG_NOT_FOUND: {
    why: 'ไม่พบแท็ก',
    possibleIssue: 'แท็กถูกลบหรือรหัสผิด',
    howToFix: 'เลือกแท็กจากรายการที่ใช้งานได้',
  },
  TAG_NOT_APPROVED: {
    why: 'แท็กยังไม่ได้รับการอนุมัติ',
    possibleIssue: 'ใช้แท็กที่รออนุมัติกับสินค้า',
    howToFix: 'รออนุมัติหรือเลือกแท็กที่อนุมัติแล้ว',
  },
  BRAND_NOT_FOUND: {
    why: 'ไม่พบแบรนด์',
    possibleIssue: 'แบรนด์ถูกลบหรือยังไม่ถูกสร้าง',
    howToFix: 'เลือกแบรนด์จากรายการ หรือเสนอแบรนด์ใหม่',
  },
  BRAND_NOT_APPROVED: {
    why: 'แบรนด์ยังไม่ได้รับการอนุมัติ',
    possibleIssue: 'ผูกสินค้ากับแบรนด์ที่รออนุมัติ',
    howToFix: 'รอแอดมินอนุมัติ หรือใช้แบรนด์ที่อนุมัติแล้ว',
  },
  PET_TYPE_NOT_FOUND: {
    why: 'ไม่พบประเภทสัตว์เลี้ยง',
    possibleIssue: 'รหัสประเภทผิดหรือถูกลบ',
    howToFix: 'เลือกประเภทสัตว์จากรายการที่มี',
  },
  PET_TYPE_NOT_APPROVED: {
    why: 'ประเภทสัตว์เลี้ยงยังไม่ได้รับการอนุมัติ',
    possibleIssue: 'ใช้ค่าที่เสนอใหม่และรออนุมัติ',
    howToFix: 'รออนุมัติหรือเลือกประเภทที่อนุมัติแล้ว',
  },
  PRODUCT_NOT_FOUND: {
    why: 'ไม่พบสินค้า',
    possibleIssue: 'สินค้าถูกลบ หรือเปิดลิงก์เก่า',
    howToFix: 'กลับไปหน้ารายการสินค้าแล้วเลือกสินค้าที่มีอยู่',
  },
  PRODUCT_NOT_PUBLISHABLE: {
    why: 'ข้อมูลสินค้ายังไม่ครบเงื่อนไขการเผยแพร่',
    possibleIssue: 'ขาดรูป ราคา สต็อก ตัวเลือก หรืออนุกรมวิธาน',
    howToFix: 'เติมข้อมูลที่จำเป็นให้ครบแล้วลองเผยแพร่อีกครั้ง',
  },
  PRODUCT_NOT_IN_STORE: {
    why: 'สินค้าไม่ได้อยู่ในร้านที่กำลังจัดการ',
    possibleIssue: 'เลือกร้านผิด หรือสินค้าย้ายร้านแล้ว',
    howToFix: 'สลับไปร้านที่ถูกต้องของสินค้า',
  },
  SKU_EXISTS: {
    why: 'รหัส SKU ซ้ำกับที่มีอยู่แล้ว',
    possibleIssue: 'ใช้ SKU เดิมกับตัวเลือกใหม่',
    howToFix: 'เปลี่ยนเป็น SKU ที่ไม่ซ้ำในร้าน/ระบบ',
  },
  VARIANTS_REQUIRED: {
    why: 'สินค้าต้องมีตัวเลือกอย่างน้อยหนึ่งรายการ',
    possibleIssue: 'ลบตัวเลือกครบหมด หรือยังไม่สร้าง SKU',
    howToFix: 'เพิ่มตัวเลือกสินค้าอย่างน้อยหนึ่งรายการ',
  },
  DUPLICATE_VARIANT_COMBINATION: {
    why: 'ชุดตัวเลือกซ้ำกัน',
    possibleIssue: 'สร้าง SKU ที่คุณสมบัติเหมือนกันสองรายการ',
    howToFix: 'รวมหรือแก้ค่าตัวเลือกให้ไม่ซ้ำ',
  },
  VARIANT_REMOVAL_BLOCKED: {
    why: 'ลบ SKU ไม่ได้เพราะมีประวัติคำสั่งซื้อหรืออยู่ในตะกร้า',
    possibleIssue: 'พยายามลบตัวเลือกที่มีธุรกรรมแล้ว',
    howToFix: 'ปิดใช้งานแทนการลบ หรือรอให้ไม่มีในตะกร้าแล้วติดต่อสนับสนุนหากจำเป็น',
  },
  INSUFFICIENT_BALANCE: {
    why: 'ยอดคงเหลือไม่พอสำหรับถอน/โอน',
    possibleIssue: 'ยอดถูกกันไว้ หรือคำนวณยอดคงเหลือไม่ตรงกับที่เห็น',
    howToFix: 'ตรวจสอบยอดที่ใช้ได้จริง แล้วขอจำนวนที่ไม่เกินยอดนั้น',
  },
  INVALID_PAYOUT_AMOUNT: {
    why: 'จำนวนเงินโอนออกไม่ถูกต้อง',
    possibleIssue: 'ใส่ 0 จำนวนติดลบ หรือรูปแบบผิด',
    howToFix: 'กรอกจำนวนเงินที่ถูกต้องตามขั้นต่ำและยอดที่ใช้ได้',
  },
  PAYOUT_ALREADY_PENDING: {
    why: 'มีคำขอโอนเงินที่รออยู่แล้ว',
    possibleIssue: 'ส่งคำขอถอนซ้ำก่อนคำขอเดิมเสร็จ',
    howToFix: 'รอคำขอเดิมเสร็จหรือถูกปฏิเสธก่อนส่งใหม่',
  },
  PAYOUT_BELOW_MINIMUM: {
    why: 'จำนวนโอนต่ำกว่าขั้นต่ำที่กำหนด',
    possibleIssue: 'ยอดถอนน้อยกว่าขั้นต่ำของช่องทาง',
    howToFix: 'เพิ่มจำนวนให้ถึงขั้นต่ำแล้วลองใหม่',
  },
  PAYOUT_MISMATCH: {
    why: 'ข้อมูลคำขอโอนไม่ตรงกับที่ระบบคำนวณ',
    possibleIssue: 'ยอดเปลี่ยนระหว่างกรอกกับตอนยืนยัน',
    howToFix: 'รีเฟรชยอดคงเหลือแล้วสร้างคำขอใหม่',
  },
  PAYOUT_NOT_FOUND: {
    why: 'ไม่พบรายการโอนเงิน',
    possibleIssue: 'รหัสผิดหรือถูกลบ',
    howToFix: 'เปิดจากรายการโอนเงินล่าสุด',
  },
  PAYOUT_NOT_PENDING: {
    why: 'รายการโอนไม่อยู่ในสถานะรออนุมัติ/รอจ่าย',
    possibleIssue: 'ถูกจ่ายหรือปฏิเสธไปแล้ว',
    howToFix: 'รีเฟรชสถานะรายการแล้วดำเนินการตามสถานะปัจจุบัน',
  },
  PAYOUT_WRONG_RAIL: {
    why: 'ใช้ช่องทางโอนไม่ตรงกับประเภทคำขอ',
    possibleIssue: 'สับสนระหว่าง Omise กับ manual',
    howToFix: 'ใช้ขั้นตอน/ปุ่มที่ตรงกับช่องทางของรายการนั้น',
  },
  NO_PENDING_MANUAL_PAYOUT: {
    why: 'ไม่มีคำขอโอนแบบ manual ที่รออยู่',
    possibleIssue: 'คิวว่าง หรือรายการถูกจัดการไปแล้ว',
    howToFix: 'รีเฟรชคิวคำขอโอนเงินแบบ manual',
  },
  OMISE_RECIPIENT_NOT_CONNECTED: {
    why: 'ร้านยังไม่ได้เชื่อมบัญชีรับเงิน Omise',
    possibleIssue: 'ยังไม่ได้ตั้งค่า recipient',
    howToFix: 'เชื่อมต่อบัญชีรับเงิน Omise ในหน้าการเงินของร้าน',
  },
  OMISE_RECIPIENT_NOT_READY: {
    why: 'บัญชีรับเงิน Omise ยังไม่พร้อม',
    possibleIssue: 'รอการยืนยันจาก Omise หรือข้อมูลบัญชีไม่ครบ',
    howToFix: 'ตรวจสอบสถานะ recipient ใน Omise/หน้าการตั้งค่า แล้วลองใหม่เมื่อพร้อม',
  },
  OMISE_TRANSFER_FAILED: {
    why: 'การโอนผ่าน Omise ล้มเหลว',
    possibleIssue: 'ปัญหาฝั่ง Omise หรือบัญชีรับเงิน',
    howToFix: 'ตรวจสอบสถานะใน Omise แล้วลองใหม่หรือใช้ช่องทางอื่นตามนโยบาย',
  },
  EMAIL_TEMPLATE_NOT_FOUND: {
    why: 'ไม่พบเทมเพลตอีเมล',
    possibleIssue: 'เทมเพลตถูกลบหรือรหัสผิด',
    howToFix: 'เลือกเทมเพลตจากรายการในอีเมล CMS',
  },
  EMAIL_DEFAULT_CONTAINER_REQUIRED: {
    why: 'ต้องมีคอนเทนเนอร์อีเมลเริ่มต้น',
    possibleIssue: 'ลบหรือยังไม่ตั้งค่า default container',
    howToFix: 'ตั้งคอนเทนเนอร์เริ่มต้นก่อนบันทึกเทมเพลต',
  },
  EMAIL_CONTAINER_SLOT_INVALID: {
    why: 'ช่องคอนเทนเนอร์อีเมลไม่ถูกต้อง',
    possibleIssue: 'วางบล็อกในสล็อตที่ไม่อนุญาต',
    howToFix: 'ย้ายเนื้อหาไปยังสล็อตที่รองรับตามโครงเทมเพลต',
  },
  EMAIL_HTML_BLOCKED: {
    why: 'พบ HTML ที่ไม่อนุญาตในเทมเพลต',
    possibleIssue: 'มีสคริปต์หรือแท็กอันตราย',
    howToFix: 'ลบ HTML ที่ไม่ปลอดภัยแล้วใช้บล็อกที่ระบบรองรับ',
  },
  EMAIL_UNKNOWN_PLACEHOLDERS: {
    why: 'มีตัวแปรในเทมเพลตที่ระบบไม่รู้จัก',
    possibleIssue: 'พิมพ์ชื่อตัวแปรผิด',
    howToFix: 'ใช้เฉพาะตัวแปรจากรายการที่ระบบกำหนด',
  },
  EMAIL_INVALID_VARIABLES_JSON: {
    why: 'รูปแบบ JSON ของตัวแปรอีเมลไม่ถูกต้อง',
    possibleIssue: 'JSON ผิดรูปหรือชนิดข้อมูลไม่ตรง',
    howToFix: 'แก้ JSON ให้ถูกต้องตามสคีมาตัวแปร',
  },
  EMAIL_TEST_SEND_FAILED: {
    why: 'ส่งอีเมลทดสอบไม่สำเร็จ',
    possibleIssue: 'ผู้ให้บริการอีเมลล่ม หรือที่อยู่ปลายทางผิด',
    howToFix: 'ตรวจสอบการตั้งค่าอีเมลและที่อยู่ทดสอบ แล้วส่งใหม่',
  },
  HOLD_TRANSITION_FORBIDDEN: {
    why: 'รายการถูกระงับจากการระงับร้าน จึงเปลี่ยนสถานะไม่ได้',
    possibleIssue: 'ร้านถูกระงับและออเดอร์อยู่ในโหมด hold',
    howToFix: 'รอให้ร้านกลับมาใช้งานหรือให้แอดมินจัดการ hold ตามนโยบาย',
  },
  HOLD_CANCEL_FORBIDDEN: {
    why: 'ไม่สามารถยกเลิกรายการที่ถูก hold จากการระงับร้าน',
    possibleIssue: 'พยายามยกเลิกออเดอร์/ส่วนที่ถูก hold',
    howToFix: 'ใช้ขั้นตอนกู้คืน/จัดการ hold ที่กำหนด ไม่ยกเลิกตรงๆ',
  },
  HOLD_RESTORE_SNAPSHOT_MISSING: {
    why: 'ไม่มีข้อมูล snapshot สำหรับกู้คืนคำสั่งซื้อที่ถูก hold',
    possibleIssue: 'ข้อมูลกู้คืนหายหรือไม่ถูกบันทึกตอนระงับ',
    howToFix: 'ติดต่อฝ่ายสนับสนุน/วิศวกรรมเพื่อตรวจสอบข้อมูล hold',
  },
  ORDER_CONTAINS_SUSPENDED_STORE: {
    why: 'คำสั่งซื้อมีสินค้าจากร้านที่ถูกระงับ',
    possibleIssue: 'ร้านถูกระงับหลังใส่ตะกร้าหรือตอนเช็คเอาต์',
    howToFix: 'ลบสินค้าจากร้านที่ถูกระงับแล้วดำเนินการต่อ',
  },
  PAYMENT_HELD_PORTION_BLOCKED: {
    why: 'ส่วนที่ถูก hold ไม่สามารถชำระหรือดำเนินการชำระได้',
    possibleIssue: 'มีส่วนของออเดอร์ที่ถูกระงับจากการระงับร้าน',
    howToFix: 'จัดการเฉพาะส่วนที่ไม่ถูก hold หรือรอการกู้คืนตามนโยบาย',
  },
  BANK_TRANSFER_ADMIN_ONLY: {
    why: 'เฉพาะแอดมินที่ยืนยันการโอนเงินเข้าบัญชีได้',
    possibleIssue: 'ผู้ขายพยายามยืนยันสลิปเอง',
    howToFix: 'ให้แอดมินตรวจสอบและยืนยันในคิวโอนเงิน',
  },
  BANK_TRANSFER_NOT_CONFIGURED: {
    why: 'ยังไม่ได้ตั้งค่าบัญชีรับโอน',
    possibleIssue: 'ขาดข้อมูลบัญชีธนาคารของแพลตฟอร์ม',
    howToFix: 'ให้แอดมินตั้งค่าบัญชีรับโอนก่อนเปิดใช้วิธีนี้',
  },
};

/** Grouped catalog base (code + group); docs merged below. */
const ERROR_CATALOG_BASE: Array<{ code: ErrorMessageCode; message: string; group: string }> = [
  { code: 'UNKNOWN_ERROR', message: ERROR_MESSAGES.UNKNOWN_ERROR, group: 'ทั่วไป / ระบบ' },
  {
    code: 'INTERNAL_SERVER_ERROR',
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    group: 'ทั่วไป / ระบบ',
  },
  { code: 'GRAPHQL_ERROR', message: ERROR_MESSAGES.GRAPHQL_ERROR, group: 'ทั่วไป / ระบบ' },
  { code: 'HTTP_ERROR', message: ERROR_MESSAGES.HTTP_ERROR, group: 'ทั่วไป / ระบบ' },
  { code: 'NETWORK_ERROR', message: ERROR_MESSAGES.NETWORK_ERROR, group: 'ทั่วไป / ระบบ' },
  { code: 'TIMEOUT', message: ERROR_MESSAGES.TIMEOUT, group: 'ทั่วไป / ระบบ' },
  { code: 'RENDER_ERROR', message: ERROR_MESSAGES.RENDER_ERROR, group: 'ทั่วไป / ระบบ' },
  { code: 'BAD_REQUEST', message: ERROR_MESSAGES.BAD_REQUEST, group: 'ทั่วไป / ระบบ' },
  { code: 'VALIDATION_ERROR', message: ERROR_MESSAGES.VALIDATION_ERROR, group: 'ทั่วไป / ระบบ' },
  { code: 'NOT_FOUND', message: ERROR_MESSAGES.NOT_FOUND, group: 'ทั่วไป / ระบบ' },
  { code: 'CONFLICT', message: ERROR_MESSAGES.CONFLICT, group: 'ทั่วไป / ระบบ' },
  { code: 'PAYLOAD_TOO_LARGE', message: ERROR_MESSAGES.PAYLOAD_TOO_LARGE, group: 'ทั่วไป / ระบบ' },
  { code: 'TOO_MANY_REQUESTS', message: ERROR_MESSAGES.TOO_MANY_REQUESTS, group: 'ทั่วไป / ระบบ' },
  {
    code: 'RATE_LIMIT_EXCEEDED',
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    group: 'ทั่วไป / ระบบ',
  },
  {
    code: 'STORAGE_NOT_CONFIGURED',
    message: ERROR_MESSAGES.STORAGE_NOT_CONFIGURED,
    group: 'ทั่วไป / ระบบ',
  },
  { code: 'UPLOAD_FAILED', message: ERROR_MESSAGES.UPLOAD_FAILED, group: 'ทั่วไป / ระบบ' },
  { code: 'INVALID_FOLDER', message: ERROR_MESSAGES.INVALID_FOLDER, group: 'ทั่วไป / ระบบ' },
  { code: 'INVALID_BASE64', message: ERROR_MESSAGES.INVALID_BASE64, group: 'ทั่วไป / ระบบ' },
  {
    code: 'SMS_NOT_CONFIGURED',
    message: ERROR_MESSAGES.SMS_NOT_CONFIGURED,
    group: 'ทั่วไป / ระบบ',
  },
  {
    code: 'SMS_DELIVERY_FAILED',
    message: ERROR_MESSAGES.SMS_DELIVERY_FAILED,
    group: 'ทั่วไป / ระบบ',
  },
  {
    code: 'STOREFRONT_URL_NOT_CONFIGURED',
    message: ERROR_MESSAGES.STOREFRONT_URL_NOT_CONFIGURED,
    group: 'ทั่วไป / ระบบ',
  },
  {
    code: 'UNAUTHENTICATED',
    message: ERROR_MESSAGES.UNAUTHENTICATED,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  { code: 'UNAUTHORIZED', message: ERROR_MESSAGES.UNAUTHORIZED, group: 'การยืนยันตัวตน / สิทธิ์' },
  {
    code: 'SESSION_EXPIRED',
    message: ERROR_MESSAGES.SESSION_EXPIRED,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'INVALID_CREDENTIALS',
    message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'INVALID_PASSWORD',
    message: ERROR_MESSAGES.INVALID_PASSWORD,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  { code: 'INVALID_OTP', message: ERROR_MESSAGES.INVALID_OTP, group: 'การยืนยันตัวตน / สิทธิ์' },
  {
    code: 'INVALID_TOKEN',
    message: ERROR_MESSAGES.INVALID_TOKEN,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'TOKEN_EXPIRED',
    message: ERROR_MESSAGES.TOKEN_EXPIRED,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'INVALID_REFRESH_TOKEN',
    message: ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'INVALID_REACTIVATION_TOKEN',
    message: ERROR_MESSAGES.INVALID_REACTIVATION_TOKEN,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'TOO_MANY_ATTEMPTS',
    message: ERROR_MESSAGES.TOO_MANY_ATTEMPTS,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'ACCOUNT_SUSPENDED',
    message: ERROR_MESSAGES.ACCOUNT_SUSPENDED,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'CUSTOMER_SUSPENDED',
    message: ERROR_MESSAGES.CUSTOMER_SUSPENDED,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'CUSTOMER_PENDING_DELETION',
    message: ERROR_MESSAGES.CUSTOMER_PENDING_DELETION,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  { code: 'FORBIDDEN', message: ERROR_MESSAGES.FORBIDDEN, group: 'การยืนยันตัวตน / สิทธิ์' },
  {
    code: 'STORE_MANAGER_REQUIRED',
    message: ERROR_MESSAGES.STORE_MANAGER_REQUIRED,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'STORE_OWNER_REQUIRED',
    message: ERROR_MESSAGES.STORE_OWNER_REQUIRED,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'STORE_ACCESS_DENIED',
    message: ERROR_MESSAGES.STORE_ACCESS_DENIED,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  { code: 'INVALID_ROLE', message: ERROR_MESSAGES.INVALID_ROLE, group: 'การยืนยันตัวตน / สิทธิ์' },
  {
    code: 'CANNOT_CHANGE_OWNER',
    message: ERROR_MESSAGES.CANNOT_CHANGE_OWNER,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'CANNOT_REMOVE_OWNER',
    message: ERROR_MESSAGES.CANNOT_REMOVE_OWNER,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'INVALID_API_KEY',
    message: ERROR_MESSAGES.INVALID_API_KEY,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'API_KEY_NOT_FOUND',
    message: ERROR_MESSAGES.API_KEY_NOT_FOUND,
    group: 'การยืนยันตัวตน / สิทธิ์',
  },
  {
    code: 'CART_IDENTITY_REQUIRED',
    message: ERROR_MESSAGES.CART_IDENTITY_REQUIRED,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'CART_ITEM_NOT_FOUND',
    message: ERROR_MESSAGES.CART_ITEM_NOT_FOUND,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'INSUFFICIENT_STOCK',
    message: ERROR_MESSAGES.INSUFFICIENT_STOCK,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'VARIANT_NOT_FOUND',
    message: ERROR_MESSAGES.VARIANT_NOT_FOUND,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'VARIANT_REQUIRED',
    message: ERROR_MESSAGES.VARIANT_REQUIRED,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'GUEST_PHONE_REQUIRED',
    message: ERROR_MESSAGES.GUEST_PHONE_REQUIRED,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'SHIPPING_ADDRESS_REQUIRED',
    message: ERROR_MESSAGES.SHIPPING_ADDRESS_REQUIRED,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'INVALID_SHIPPING_ADDRESS',
    message: ERROR_MESSAGES.INVALID_SHIPPING_ADDRESS,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'SHIPPING_OPTION_REQUIRED',
    message: ERROR_MESSAGES.SHIPPING_OPTION_REQUIRED,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'INVALID_SHIPPING_OPTION',
    message: ERROR_MESSAGES.INVALID_SHIPPING_OPTION,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'SAVED_ADDRESS_NOT_FOUND',
    message: ERROR_MESSAGES.SAVED_ADDRESS_NOT_FOUND,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'SAVED_ADDRESS_REQUIRES_LOGIN',
    message: ERROR_MESSAGES.SAVED_ADDRESS_REQUIRES_LOGIN,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'ORDER_CONTAINS_SUSPENDED_STORE',
    message: ERROR_MESSAGES.ORDER_CONTAINS_SUSPENDED_STORE,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'SUSPENDED_STORE_ITEM_REMOVED',
    message: ERROR_MESSAGES.SUSPENDED_STORE_ITEM_REMOVED,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  { code: 'MISSING_LINES', message: ERROR_MESSAGES.MISSING_LINES, group: 'ตะกร้า / เช็คเอาต์' },
  {
    code: 'QUANTITY_TOO_LARGE',
    message: ERROR_MESSAGES.QUANTITY_TOO_LARGE,
    group: 'ตะกร้า / เช็คเอาต์',
  },
  {
    code: 'ORDER_NOT_FOUND',
    message: ERROR_MESSAGES.ORDER_NOT_FOUND,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'ORDER_NOT_PAYABLE',
    message: ERROR_MESSAGES.ORDER_NOT_PAYABLE,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'ORDER_ALREADY_CANCELLED',
    message: ERROR_MESSAGES.ORDER_ALREADY_CANCELLED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'ORDER_NOT_FULLY_SHIPPED',
    message: ERROR_MESSAGES.ORDER_NOT_FULLY_SHIPPED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'ORDER_NOT_REVIEWABLE',
    message: ERROR_MESSAGES.ORDER_NOT_REVIEWABLE,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'INVALID_ORDER_STATUS',
    message: ERROR_MESSAGES.INVALID_ORDER_STATUS,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'MULTI_VENDOR_ORDER',
    message: ERROR_MESSAGES.MULTI_VENDOR_ORDER,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'HOLD_TRANSITION_FORBIDDEN',
    message: ERROR_MESSAGES.HOLD_TRANSITION_FORBIDDEN,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'HOLD_CANCEL_FORBIDDEN',
    message: ERROR_MESSAGES.HOLD_CANCEL_FORBIDDEN,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'HOLD_RESTORE_SNAPSHOT_MISSING',
    message: ERROR_MESSAGES.HOLD_RESTORE_SNAPSHOT_MISSING,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'BANK_TRANSFER_ADMIN_ONLY',
    message: ERROR_MESSAGES.BANK_TRANSFER_ADMIN_ONLY,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'BANK_TRANSFER_NOT_CONFIGURED',
    message: ERROR_MESSAGES.BANK_TRANSFER_NOT_CONFIGURED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'BANK_TRANSFER_FIELD_REQUIRED',
    message: ERROR_MESSAGES.BANK_TRANSFER_FIELD_REQUIRED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'BANK_TRANSFER_FIELD_TOO_LONG',
    message: ERROR_MESSAGES.BANK_TRANSFER_FIELD_TOO_LONG,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'NOT_BANK_TRANSFER',
    message: ERROR_MESSAGES.NOT_BANK_TRANSFER,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'USE_CONFIRM_BANK_TRANSFER',
    message: ERROR_MESSAGES.USE_CONFIRM_BANK_TRANSFER,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYMENT_NOT_FOUND',
    message: ERROR_MESSAGES.PAYMENT_NOT_FOUND,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYMENT_NOT_CONFIRMABLE',
    message: ERROR_MESSAGES.PAYMENT_NOT_CONFIRMABLE,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYMENT_HELD_PORTION_BLOCKED',
    message: ERROR_MESSAGES.PAYMENT_HELD_PORTION_BLOCKED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYMENT_METHOD_NOT_FOUND',
    message: ERROR_MESSAGES.PAYMENT_METHOD_NOT_FOUND,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYMENT_METHOD_ALREADY_EXISTS',
    message: ERROR_MESSAGES.PAYMENT_METHOD_ALREADY_EXISTS,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYMENT_SUBSCRIPTION_TARGET_REQUIRED',
    message: ERROR_MESSAGES.PAYMENT_SUBSCRIPTION_TARGET_REQUIRED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'CARD_TOKEN_REQUIRED',
    message: ERROR_MESSAGES.CARD_TOKEN_REQUIRED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'CUSTOMER_REQUIRED',
    message: ERROR_MESSAGES.CUSTOMER_REQUIRED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'OMISE_NOT_CONFIGURED',
    message: ERROR_MESSAGES.OMISE_NOT_CONFIGURED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'OMISE_ERROR',
    message: ERROR_MESSAGES.OMISE_ERROR,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'OMISE_CARD_NOT_FOUND',
    message: ERROR_MESSAGES.OMISE_CARD_NOT_FOUND,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'OMISE_CUSTOMER_NOT_FOUND',
    message: ERROR_MESSAGES.OMISE_CUSTOMER_NOT_FOUND,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'OMISE_RECIPIENT_NOT_CONNECTED',
    message: ERROR_MESSAGES.OMISE_RECIPIENT_NOT_CONNECTED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'OMISE_RECIPIENT_NOT_READY',
    message: ERROR_MESSAGES.OMISE_RECIPIENT_NOT_READY,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'OMISE_TRANSFER_FAILED',
    message: ERROR_MESSAGES.OMISE_TRANSFER_FAILED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'INSUFFICIENT_BALANCE',
    message: ERROR_MESSAGES.INSUFFICIENT_BALANCE,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'INVALID_PAYOUT_AMOUNT',
    message: ERROR_MESSAGES.INVALID_PAYOUT_AMOUNT,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYOUT_ALREADY_PENDING',
    message: ERROR_MESSAGES.PAYOUT_ALREADY_PENDING,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYOUT_BELOW_MINIMUM',
    message: ERROR_MESSAGES.PAYOUT_BELOW_MINIMUM,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYOUT_MISMATCH',
    message: ERROR_MESSAGES.PAYOUT_MISMATCH,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYOUT_NOT_FOUND',
    message: ERROR_MESSAGES.PAYOUT_NOT_FOUND,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYOUT_NOT_PENDING',
    message: ERROR_MESSAGES.PAYOUT_NOT_PENDING,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'PAYOUT_WRONG_RAIL',
    message: ERROR_MESSAGES.PAYOUT_WRONG_RAIL,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'NO_PENDING_MANUAL_PAYOUT',
    message: ERROR_MESSAGES.NO_PENDING_MANUAL_PAYOUT,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'COMMISSION_FORMULA_MISMATCH',
    message: ERROR_MESSAGES.COMMISSION_FORMULA_MISMATCH,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'INVALID_COMMISSION_RATE',
    message: ERROR_MESSAGES.INVALID_COMMISSION_RATE,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'FULFILLMENT_PROVIDER_REQUIRED',
    message: ERROR_MESSAGES.FULFILLMENT_PROVIDER_REQUIRED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'FULFILLMENT_PROVIDER_TOO_LONG',
    message: ERROR_MESSAGES.FULFILLMENT_PROVIDER_TOO_LONG,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'INVALID_FULFILLMENT_STATE',
    message: ERROR_MESSAGES.INVALID_FULFILLMENT_STATE,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'NO_STORE_ITEMS',
    message: ERROR_MESSAGES.NO_STORE_ITEMS,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'TRACKING_NUMBER_REQUIRED',
    message: ERROR_MESSAGES.TRACKING_NUMBER_REQUIRED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'TRACKING_NUMBER_TOO_LONG',
    message: ERROR_MESSAGES.TRACKING_NUMBER_TOO_LONG,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'TRACKING_URL_REQUIRED',
    message: ERROR_MESSAGES.TRACKING_URL_REQUIRED,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'TRACKING_URL_INVALID',
    message: ERROR_MESSAGES.TRACKING_URL_INVALID,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'TRACKING_URL_INSECURE',
    message: ERROR_MESSAGES.TRACKING_URL_INSECURE,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'TRACKING_URL_TOO_LONG',
    message: ERROR_MESSAGES.TRACKING_URL_TOO_LONG,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'INVALID_AUDIT_EVENT',
    message: ERROR_MESSAGES.INVALID_AUDIT_EVENT,
    group: 'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  },
  {
    code: 'INVALID_PROMOTION',
    message: ERROR_MESSAGES.INVALID_PROMOTION,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'PROMOTION_NOT_FOUND',
    message: ERROR_MESSAGES.PROMOTION_NOT_FOUND,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'PROMOTION_EXPIRED',
    message: ERROR_MESSAGES.PROMOTION_EXPIRED,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'PROMOTION_NOT_STARTED',
    message: ERROR_MESSAGES.PROMOTION_NOT_STARTED,
    group: 'โปรโมชัน / แคมเปญ',
  },
  { code: 'PROMOTION_LIMIT', message: ERROR_MESSAGES.PROMOTION_LIMIT, group: 'โปรโมชัน / แคมเปญ' },
  {
    code: 'PROMOTION_CUSTOMER_LIMIT',
    message: ERROR_MESSAGES.PROMOTION_CUSTOMER_LIMIT,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'PROMOTION_MIN_PURCHASE',
    message: ERROR_MESSAGES.PROMOTION_MIN_PURCHASE,
    group: 'โปรโมชัน / แคมเปญ',
  },
  { code: 'PROMOTION_SCOPE', message: ERROR_MESSAGES.PROMOTION_SCOPE, group: 'โปรโมชัน / แคมเปญ' },
  { code: 'PROMOTION_STORE', message: ERROR_MESSAGES.PROMOTION_STORE, group: 'โปรโมชัน / แคมเปญ' },
  {
    code: 'INVALID_PROMOTION_DATE_RANGE',
    message: ERROR_MESSAGES.INVALID_PROMOTION_DATE_RANGE,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'INVALID_VALIDATE_PROMOTIONS_INPUT',
    message: ERROR_MESSAGES.INVALID_VALIDATE_PROMOTIONS_INPUT,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'INVALID_CONDITIONS',
    message: ERROR_MESSAGES.INVALID_CONDITIONS,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'INVALID_BXGY_CONDITIONS',
    message: ERROR_MESSAGES.INVALID_BXGY_CONDITIONS,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'INVALID_DISCOUNT_VALUE',
    message: ERROR_MESSAGES.INVALID_DISCOUNT_VALUE,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'INVALID_LOGGED_IN_ONLY_CONDITIONS',
    message: ERROR_MESSAGES.INVALID_LOGGED_IN_ONLY_CONDITIONS,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'INVALID_NEW_CUSTOMER_CONDITIONS',
    message: ERROR_MESSAGES.INVALID_NEW_CUSTOMER_CONDITIONS,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'SALE_CAMPAIGN_NOT_FOUND',
    message: ERROR_MESSAGES.SALE_CAMPAIGN_NOT_FOUND,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'INVALID_SALE_CAMPAIGN_DATE_RANGE',
    message: ERROR_MESSAGES.INVALID_SALE_CAMPAIGN_DATE_RANGE,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'SALE_CAMPAIGN_ITEM_DISCOUNT_REQUIRED',
    message: ERROR_MESSAGES.SALE_CAMPAIGN_ITEM_DISCOUNT_REQUIRED,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'SALE_CAMPAIGN_COMPARE_AT_INVALID',
    message: ERROR_MESSAGES.SALE_CAMPAIGN_COMPARE_AT_INVALID,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'PRODUCT_NOT_IN_STORE',
    message: ERROR_MESSAGES.PRODUCT_NOT_IN_STORE,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'VARIANT_NOT_ON_PRODUCT',
    message: ERROR_MESSAGES.VARIANT_NOT_ON_PRODUCT,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'PRODUCT_STORE_MISMATCH',
    message: ERROR_MESSAGES.PRODUCT_STORE_MISMATCH,
    group: 'โปรโมชัน / แคมเปญ',
  },
  {
    code: 'PRODUCT_NOT_FOUND',
    message: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'PRODUCT_NOT_PUBLISHABLE',
    message: ERROR_MESSAGES.PRODUCT_NOT_PUBLISHABLE,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'PRODUCT_NOT_IN_ORDER',
    message: ERROR_MESSAGES.PRODUCT_NOT_IN_ORDER,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  { code: 'SKU_EXISTS', message: ERROR_MESSAGES.SKU_EXISTS, group: 'แคตตาล็อก / อนุกรมวิธาน' },
  {
    code: 'VARIANTS_REQUIRED',
    message: ERROR_MESSAGES.VARIANTS_REQUIRED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'VARIANT_ITEMS_REQUIRED',
    message: ERROR_MESSAGES.VARIANT_ITEMS_REQUIRED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'INVALID_VARIANT_OPTIONS',
    message: ERROR_MESSAGES.INVALID_VARIANT_OPTIONS,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'DUPLICATE_VARIANT_GROUP',
    message: ERROR_MESSAGES.DUPLICATE_VARIANT_GROUP,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'DUPLICATE_VARIANT_COMBINATION',
    message: ERROR_MESSAGES.DUPLICATE_VARIANT_COMBINATION,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'VARIANT_REMOVAL_BLOCKED',
    message: ERROR_MESSAGES.VARIANT_REMOVAL_BLOCKED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'IMAGE_NOT_FOUND',
    message: ERROR_MESSAGES.IMAGE_NOT_FOUND,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'TOO_MANY_IMAGES',
    message: ERROR_MESSAGES.TOO_MANY_IMAGES,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'IMAGE_TOO_LARGE',
    message: ERROR_MESSAGES.IMAGE_TOO_LARGE,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'INVALID_IMAGE',
    message: ERROR_MESSAGES.INVALID_IMAGE,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'INVALID_IMAGE_TYPE',
    message: ERROR_MESSAGES.INVALID_IMAGE_TYPE,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'INVALID_IMAGE_URL',
    message: ERROR_MESSAGES.INVALID_IMAGE_URL,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'INVALID_ASPECT_RATIO',
    message: ERROR_MESSAGES.INVALID_ASPECT_RATIO,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'INVALID_CATEGORY_IMAGE_URL',
    message: ERROR_MESSAGES.INVALID_CATEGORY_IMAGE_URL,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'CATEGORY_NOT_FOUND',
    message: ERROR_MESSAGES.CATEGORY_NOT_FOUND,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'CATEGORY_NOT_APPROVED',
    message: ERROR_MESSAGES.CATEGORY_NOT_APPROVED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'CATEGORY_IMAGE_REQUIRED',
    message: ERROR_MESSAGES.CATEGORY_IMAGE_REQUIRED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'CATEGORY_REPLACEMENT_REQUIRED',
    message: ERROR_MESSAGES.CATEGORY_REPLACEMENT_REQUIRED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'CATEGORY_REPLACEMENT_INVALID',
    message: ERROR_MESSAGES.CATEGORY_REPLACEMENT_INVALID,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'CATEGORY_HAS_PRODUCTS',
    message: ERROR_MESSAGES.CATEGORY_HAS_PRODUCTS,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'INVALID_REPLACEMENT_CATEGORY',
    message: ERROR_MESSAGES.INVALID_REPLACEMENT_CATEGORY,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'TAG_NOT_FOUND',
    message: ERROR_MESSAGES.TAG_NOT_FOUND,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'TAG_NOT_APPROVED',
    message: ERROR_MESSAGES.TAG_NOT_APPROVED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'BRAND_NOT_FOUND',
    message: ERROR_MESSAGES.BRAND_NOT_FOUND,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'BRAND_NOT_APPROVED',
    message: ERROR_MESSAGES.BRAND_NOT_APPROVED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'PET_TYPE_NOT_FOUND',
    message: ERROR_MESSAGES.PET_TYPE_NOT_FOUND,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'PET_TYPE_NOT_APPROVED',
    message: ERROR_MESSAGES.PET_TYPE_NOT_APPROVED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  {
    code: 'DUPLICATE_NAME',
    message: ERROR_MESSAGES.DUPLICATE_NAME,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  { code: 'SLUG_EXISTS', message: ERROR_MESSAGES.SLUG_EXISTS, group: 'แคตตาล็อก / อนุกรมวิธาน' },
  { code: 'INVALID_SLUG', message: ERROR_MESSAGES.INVALID_SLUG, group: 'แคตตาล็อก / อนุกรมวิธาน' },
  {
    code: 'ALREADY_FAVORITED',
    message: ERROR_MESSAGES.ALREADY_FAVORITED,
    group: 'แคตตาล็อก / อนุกรมวิธาน',
  },
  { code: 'USER_NOT_FOUND', message: ERROR_MESSAGES.USER_NOT_FOUND, group: 'บัญชี / ร้าน / ทีม' },
  {
    code: 'VENDOR_NOT_FOUND',
    message: ERROR_MESSAGES.VENDOR_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  { code: 'ADMIN_NOT_FOUND', message: ERROR_MESSAGES.ADMIN_NOT_FOUND, group: 'บัญชี / ร้าน / ทีม' },
  {
    code: 'CUSTOMER_NOT_FOUND',
    message: ERROR_MESSAGES.CUSTOMER_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  { code: 'EMAIL_EXISTS', message: ERROR_MESSAGES.EMAIL_EXISTS, group: 'บัญชี / ร้าน / ทีม' },
  { code: 'EMAIL_TAKEN', message: ERROR_MESSAGES.EMAIL_TAKEN, group: 'บัญชี / ร้าน / ทีม' },
  { code: 'EMAIL_MISMATCH', message: ERROR_MESSAGES.EMAIL_MISMATCH, group: 'บัญชี / ร้าน / ทีม' },
  {
    code: 'EMAIL_NOT_VERIFIED',
    message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'EMAIL_ALREADY_VERIFIED',
    message: ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'PHONE_ALREADY_EXISTS',
    message: ERROR_MESSAGES.PHONE_ALREADY_EXISTS,
    group: 'บัญชี / ร้าน / ทีม',
  },
  { code: 'PHONE_UNCHANGED', message: ERROR_MESSAGES.PHONE_UNCHANGED, group: 'บัญชี / ร้าน / ทีม' },
  { code: 'INVALID_PHONE', message: ERROR_MESSAGES.INVALID_PHONE, group: 'บัญชี / ร้าน / ทีม' },
  { code: 'INVALID_ADDRESS', message: ERROR_MESSAGES.INVALID_ADDRESS, group: 'บัญชี / ร้าน / ทีม' },
  {
    code: 'ADDRESS_NOT_FOUND',
    message: ERROR_MESSAGES.ADDRESS_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'INVALID_DATE_OF_BIRTH',
    message: ERROR_MESSAGES.INVALID_DATE_OF_BIRTH,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'ACCOUNT_NOT_PENDING_DELETION',
    message: ERROR_MESSAGES.ACCOUNT_NOT_PENDING_DELETION,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'DELETION_ALREADY_REQUESTED',
    message: ERROR_MESSAGES.DELETION_ALREADY_REQUESTED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'DELETION_RETENTION_EXPIRED',
    message: ERROR_MESSAGES.DELETION_RETENTION_EXPIRED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  { code: 'STORE_NOT_FOUND', message: ERROR_MESSAGES.STORE_NOT_FOUND, group: 'บัญชี / ร้าน / ทีม' },
  { code: 'STORE_SUSPENDED', message: ERROR_MESSAGES.STORE_SUSPENDED, group: 'บัญชี / ร้าน / ทีม' },
  {
    code: 'STORE_NOT_SUSPENDED',
    message: ERROR_MESSAGES.STORE_NOT_SUSPENDED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  { code: 'NO_ACTIVE_STORE', message: ERROR_MESSAGES.NO_ACTIVE_STORE, group: 'บัญชี / ร้าน / ทีม' },
  {
    code: 'NO_STORE_SELECTED',
    message: ERROR_MESSAGES.NO_STORE_SELECTED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'STORE_CONTEXT_REQUIRED',
    message: ERROR_MESSAGES.STORE_CONTEXT_REQUIRED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'STORE_ID_REQUIRED',
    message: ERROR_MESSAGES.STORE_ID_REQUIRED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  { code: 'OWNER_REQUIRED', message: ERROR_MESSAGES.OWNER_REQUIRED, group: 'บัญชี / ร้าน / ทีม' },
  {
    code: 'PENDING_REQUEST_EXISTS',
    message: ERROR_MESSAGES.PENDING_REQUEST_EXISTS,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'STORE_REQUEST_NOT_FOUND',
    message: ERROR_MESSAGES.STORE_REQUEST_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'PENDING_REACTIVATION_REQUEST_EXISTS',
    message: ERROR_MESSAGES.PENDING_REACTIVATION_REQUEST_EXISTS,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'REACTIVATION_REQUEST_NOT_FOUND',
    message: ERROR_MESSAGES.REACTIVATION_REQUEST_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  { code: 'INVALID_STATUS', message: ERROR_MESSAGES.INVALID_STATUS, group: 'บัญชี / ร้าน / ทีม' },
  { code: 'MEMBER_EXISTS', message: ERROR_MESSAGES.MEMBER_EXISTS, group: 'บัญชี / ร้าน / ทีม' },
  {
    code: 'MEMBER_NOT_FOUND',
    message: ERROR_MESSAGES.MEMBER_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'INVITATION_EXISTS',
    message: ERROR_MESSAGES.INVITATION_EXISTS,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'INVITATION_EXPIRED',
    message: ERROR_MESSAGES.INVITATION_EXPIRED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'INVITATION_INVALID',
    message: ERROR_MESSAGES.INVITATION_INVALID,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'INVITATION_NOT_FOUND',
    message: ERROR_MESSAGES.INVITATION_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'INVITATION_NOT_PENDING',
    message: ERROR_MESSAGES.INVITATION_NOT_PENDING,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'NOTIFICATION_NOT_FOUND',
    message: ERROR_MESSAGES.NOTIFICATION_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'BANNER_NOT_FOUND',
    message: ERROR_MESSAGES.BANNER_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'SPONSOR_NOT_FOUND',
    message: ERROR_MESSAGES.SPONSOR_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  { code: 'AD_NOT_FOUND', message: ERROR_MESSAGES.AD_NOT_FOUND, group: 'บัญชี / ร้าน / ทีม' },
  {
    code: 'LOGIN_PAGE_IMAGES_DESKTOP_REQUIRED',
    message: ERROR_MESSAGES.LOGIN_PAGE_IMAGES_DESKTOP_REQUIRED,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'LOGIN_PAGE_IMAGES_ALT_TOO_LONG',
    message: ERROR_MESSAGES.LOGIN_PAGE_IMAGES_ALT_TOO_LONG,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'SHIPPING_OPTION_NOT_FOUND',
    message: ERROR_MESSAGES.SHIPPING_OPTION_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'SHIPPING_PROVIDER_NOT_FOUND',
    message: ERROR_MESSAGES.SHIPPING_PROVIDER_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'LAST_SHIPPING_OPTION',
    message: ERROR_MESSAGES.LAST_SHIPPING_OPTION,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'LAST_ACTIVE_SHIPPING_OPTION',
    message: ERROR_MESSAGES.LAST_ACTIVE_SHIPPING_OPTION,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'WEBHOOK_NOT_FOUND',
    message: ERROR_MESSAGES.WEBHOOK_NOT_FOUND,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'INVALID_WEBHOOK_URL',
    message: ERROR_MESSAGES.INVALID_WEBHOOK_URL,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'INVALID_WEBHOOK_EVENT',
    message: ERROR_MESSAGES.INVALID_WEBHOOK_EVENT,
    group: 'บัญชี / ร้าน / ทีม',
  },
  {
    code: 'EMAIL_TEMPLATE_NOT_FOUND',
    message: ERROR_MESSAGES.EMAIL_TEMPLATE_NOT_FOUND,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'EMAIL_DEFAULT_CONTAINER_REQUIRED',
    message: ERROR_MESSAGES.EMAIL_DEFAULT_CONTAINER_REQUIRED,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'EMAIL_CONTAINER_SLOT_INVALID',
    message: ERROR_MESSAGES.EMAIL_CONTAINER_SLOT_INVALID,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'EMAIL_HTML_BLOCKED',
    message: ERROR_MESSAGES.EMAIL_HTML_BLOCKED,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'EMAIL_UNKNOWN_PLACEHOLDERS',
    message: ERROR_MESSAGES.EMAIL_UNKNOWN_PLACEHOLDERS,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'EMAIL_INVALID_VARIABLES_JSON',
    message: ERROR_MESSAGES.EMAIL_INVALID_VARIABLES_JSON,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'EMAIL_TEST_SEND_FAILED',
    message: ERROR_MESSAGES.EMAIL_TEST_SEND_FAILED,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_NOT_FOUND',
    message: ERROR_MESSAGES.REVIEW_NOT_FOUND,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_ALREADY_EXISTS',
    message: ERROR_MESSAGES.REVIEW_ALREADY_EXISTS,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_NOT_APPROVED',
    message: ERROR_MESSAGES.REVIEW_NOT_APPROVED,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_WINDOW_EXPIRED',
    message: ERROR_MESSAGES.REVIEW_WINDOW_EXPIRED,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_TOO_MANY_IMAGES',
    message: ERROR_MESSAGES.REVIEW_TOO_MANY_IMAGES,
    group: 'อีเมล CMS / รีวิว',
  },
  { code: 'INVALID_RATING', message: ERROR_MESSAGES.INVALID_RATING, group: 'อีเมล CMS / รีวิว' },
  {
    code: 'INVALID_REVIEW_STATUS',
    message: ERROR_MESSAGES.INVALID_REVIEW_STATUS,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_REPLY_NOT_FOUND',
    message: ERROR_MESSAGES.REVIEW_REPLY_NOT_FOUND,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_REPLY_ALREADY_EXISTS',
    message: ERROR_MESSAGES.REVIEW_REPLY_ALREADY_EXISTS,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_REPLY_BODY_EMPTY',
    message: ERROR_MESSAGES.REVIEW_REPLY_BODY_EMPTY,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_REPLY_BODY_INVALID',
    message: ERROR_MESSAGES.REVIEW_REPLY_BODY_INVALID,
    group: 'อีเมล CMS / รีวิว',
  },
  {
    code: 'REVIEW_REPLY_BODY_TOO_LONG',
    message: ERROR_MESSAGES.REVIEW_REPLY_BODY_TOO_LONG,
    group: 'อีเมล CMS / รีวิว',
  },
];

/** Grouped catalog for public /errors-message pages (message + optional docs). */
export const ERROR_CATALOG: ErrorCatalogEntry[] = ERROR_CATALOG_BASE.map((entry) => ({
  ...entry,
  ...ERROR_CATALOG_DOCS[entry.code],
}));

/** Client-side catalog search: matches code, message, group, and optional docs. */
export function matchesErrorCatalogQuery(entry: ErrorCatalogEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    entry.code,
    entry.message,
    entry.group,
    entry.why,
    entry.possibleIssue,
    entry.howToFix,
  ]
    .filter((part): part is string => Boolean(part))
    .join('\n')
    .toLowerCase();
  return haystack.includes(q);
}

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
  'STORE_ACCESS_DENIED',
  'STORE_OWNER_REQUIRED',
]);

const ENVELOPE_FALLBACK = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

const SCREAMING_SNAKE_CODE = /^[A-Z][A-Z0-9_]*$/;

export function isScreamingSnakeCode(value: string): boolean {
  return SCREAMING_SNAKE_CODE.test(value);
}

/**
 * Map an API error code to Thai UI copy.
 * API payloads may send `message === code`; never prefer API text over the catalog.
 */
export function messageForErrorCode(code: string, apiMessage?: string): string {
  const mapped = ERROR_MESSAGES[code as ErrorMessageCode];
  if (mapped) {
    return mapped;
  }

  const trimmed = apiMessage?.trim();
  // Missing, English/technical, or code-as-message → catalog fallback only.
  if (
    !trimmed ||
    trimmed === code ||
    isScreamingSnakeCode(trimmed) ||
    isOpaqueTechnicalMessage(trimmed) ||
    !containsThai(trimmed)
  ) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Unmapped codes: do not use API Thai as copy either (API is code-only).
  return ERROR_MESSAGES.UNKNOWN_ERROR;
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

/** Append a stable code so operators can reference /errors-message or support. */
export function formatFallbackErrorMessage(message: string, code: string): string {
  const trimmed = message.trim();
  const normalizedCode = code.trim() || 'UNKNOWN_ERROR';
  if (!trimmed) return `(${normalizedCode})`;
  return `${trimmed} (${normalizedCode})`;
}
