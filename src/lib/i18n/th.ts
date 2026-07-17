export const productStatusLabels: Record<string, string> = {
  draft: 'ฉบับร่าง',
  published: 'เผยแพร่',
  archived: 'เก็บถาวร',
};

export const orderStatusLabels: Record<string, string> = {
  pending_payment: 'รอชำระเงิน',
  paid: 'ชำระแล้ว',
  processing: 'กำลังดำเนินการ',
  shipped: 'จัดส่งแล้ว',
  delivered: 'ส่งถึงแล้ว',
  cancelled: 'ยกเลิก',
  refunded: 'คืนเงินแล้ว',
};

export const paymentMethodLabels: Record<string, string> = {
  promptpay: 'พร้อมเพย์',
  credit_card: 'บัตรเครดิต',
  cod: 'เก็บเงินปลายทาง',
};

export const fulfillmentStatusLabels: Record<string, string> = {
  pending: 'รอดำเนินการ',
  processing: 'กำลังเตรียม',
  shipped: 'จัดส่งแล้ว',
  delivered: 'ส่งถึงแล้ว',
  cancelled: 'ยกเลิก',
};

export const membershipRoleLabels: Record<string, string> = {
  owner: 'เจ้าของ',
  manager: 'ผู้จัดการ',
  staff: 'พนักงาน',
};

export const membershipRoleBadgeLabels: Record<string, string> = {
  owner: 'เจ้าของ',
  manager: 'ผู้จัดการ',
  staff: 'พนักงาน',
};

/** Platform admin capabilities summary for admin team UI. */
export const adminAccessDescription =
  'อนุมัติร้านค้า จัดการข้อพิพาท ตั้งค่าแพลตฟอร์ม และเชิญผู้ดูแลคนอื่น';

/** Short permission summaries for vendor team UI (invite + role change). */
export const membershipRoleDescriptions: Record<string, string> = {
  owner: 'จัดการทีม รับเงิน ตั้งค่าร้าน และสิทธิ์ทั้งหมด',
  manager: 'จัดการ API และงานขายทั่วไป — ไม่จัดการทีมหรือรับเงิน',
  staff: 'ทำงานขายทั่วไป เช่น สินค้า คำสั่งซื้อ และโปรโมชัน',
};

export const invitationStatusLabels: Record<string, string> = {
  pending: 'รอตอบรับ',
  accepted: 'ตอบรับแล้ว',
  revoked: 'ยกเลิกแล้ว',
  expired: 'หมดอายุ',
};

export const taxonomyStatusLabels: Record<string, string> = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธแล้ว',
};

export const storeRequestStatusLabels: Record<string, string> = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธแล้ว',
};

export const storeStatusLabels: Record<string, string> = {
  pending: 'รออนุมัติ',
  approved: 'เปิดใช้งาน',
  rejected: 'ปฏิเสธแล้ว',
  suspended: 'ถูกระงับ',
};

export const promotionTypeLabels: Record<string, string> = {
  percentage: 'ส่วนลดเปอร์เซ็นต์',
  fixed_amount: 'ส่วนลดคงที่',
  free_shipping: 'จัดส่งฟรี',
  buy_x_get_y: 'ซื้อ X แถม Y',
  fixed_shipping_discount: 'ส่วนลดค่าจัดส่งคงที่',
  percentage_shipping_discount: 'ส่วนลดค่าจัดส่งเปอร์เซ็นต์',
};

export const settingsTabLabels = {
  profile: 'บัญชีผู้ใช้',
  store: 'ข้อมูลร้านค้า',
  payout: 'รับเงิน',
  shipping: 'การจัดส่ง',
} as const;

export const platformSettingsTabLabels = {
  banners: 'แบนเนอร์',
  sponsors: 'สปอนเซอร์',
  ads: 'โฆษณาป๊อปอัพ',
} as const;

export const userRoleLabels: Record<string, string> = {
  admin: 'ผู้ดูแลระบบ',
  vendor: 'ผู้ขาย',
};

export function labelProductStatus(status: string): string {
  return productStatusLabels[status] ?? status;
}

export function labelOrderStatus(status: string): string {
  return orderStatusLabels[status] ?? status;
}

export function labelPaymentMethod(method: string): string {
  return paymentMethodLabels[method] ?? method;
}

export function labelFulfillmentStatus(status: string): string {
  return fulfillmentStatusLabels[status] ?? status;
}

export function labelMembershipRole(role: string): string {
  return membershipRoleLabels[role] ?? role;
}

export function labelUserRole(role: string): string {
  return userRoleLabels[role] ?? role;
}

export function labelInvitationStatus(status: string): string {
  return invitationStatusLabels[status] ?? status;
}

export function labelTaxonomyStatus(status: string): string {
  return taxonomyStatusLabels[status] ?? status;
}

export function labelStoreRequestStatus(status: string): string {
  return storeRequestStatusLabels[status] ?? status;
}

export function labelStoreReactivationRequestStatus(status: string): string {
  return storeRequestStatusLabels[status] ?? status;
}

export function labelStoreStatus(status: string): string {
  return storeStatusLabels[status] ?? status;
}

const vendorActivityLabels: Record<string, string> = {
  account_created: 'สมัครบัญชีผู้ขาย',
  last_login: 'เข้าสู่ระบบล่าสุด',
  store_created: 'สร้างร้านค้า',
  membership_joined: 'เข้าร่วมร้านค้า',
  admin_store_approved: 'แอดมินอนุมัติร้านค้า',
  admin_store_rejected: 'แอดมินปฏิเสธร้านค้า',
  admin_store_suspended: 'แอดมินระงับร้านค้า',
  password_reset_sent: 'ส่งอีเมลรีเซ็ตรหัสผ่าน',
  vendor_updated: 'แก้ไขข้อมูลผู้ขาย',
  store_reactivated: 'เปิดใช้งานร้านค้าอีกครั้ง',
  store_owner_changed: 'เปลี่ยนเจ้าของร้านค้า',
  order_received: 'ได้รับคำสั่งซื้อ',
};

export function labelVendorActivity(kind: string): string {
  return vendorActivityLabels[kind] ?? kind;
}

export function labelPromotionType(type: string): string {
  return promotionTypeLabels[type] ?? type;
}

const notificationTypeLabels: Record<string, string> = {
  new_order: 'คำสั่งซื้อใหม่',
  order_status_changed: 'อัปเดตคำสั่งซื้อ',
  store_status_changed: 'อัปเดตร้านค้า',
  request_status_changed: 'อัปเดตคำขอ',
  new_store_request: 'คำขอเปิดร้าน',
  order_confirmation: 'ยืนยันคำสั่งซื้อ',
  order_shipped: 'จัดส่งแล้ว',
  order_delivered: 'ส่งถึงแล้ว',
  promotion: 'โปรโมชัน',
  review_request: 'ขอรีวิว',
  dispute_update: 'อัปเดตข้อพิพาท',
};

export function labelNotificationType(type: string): string {
  return notificationTypeLabels[type] ?? type;
}
