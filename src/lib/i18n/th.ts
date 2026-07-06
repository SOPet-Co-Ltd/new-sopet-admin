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
  payout: 'บัญชีรับเงิน Omise',
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

export function labelPromotionType(type: string): string {
  return promotionTypeLabels[type] ?? type;
}
