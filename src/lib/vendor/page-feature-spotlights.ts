import type { FeatureSpotlightId } from '@/lib/vendor/feature-spotlight';
import { actionGuideHref } from '@/lib/vendor/action-guide';

export type PageFeatureSpotlightConfig = {
  id: FeatureSpotlightId;
  targetId: string;
  title: string;
  body: string;
  primaryLabel: string;
  catalogTitle: string;
  catalogDescription: string;
  /** Tours hub replay URL (usually page + ?spotlight=id). */
  catalogHref: string;
  /** Optional navigate after primary CTA. */
  completeHref?: string;
};

export const PAGE_FEATURE_SPOTLIGHTS: Record<
  Exclude<FeatureSpotlightId, 'products-empty-add'>,
  PageFeatureSpotlightConfig
> = {
  'customers-empty-intro': {
    id: 'customers-empty-intro',
    targetId: 'customers-empty-state',
    title: 'ลูกค้าของร้าน',
    body: 'ลูกค้าจะปรากฏที่นี่หลังสั่งซื้อจากร้านคุณ — ใช้ค้นหาเพื่อดูประวัติและรายละเอียดได้ภายหลัง',
    primaryLabel: 'เข้าใจแล้ว',
    catalogTitle: 'แนะนำหน้าลูกค้า',
    catalogDescription: 'อธิบายว่าลูกค้ามาจากออเดอร์ และวิธีค้นหาเมื่อมีรายการแล้ว',
    catalogHref: '/vendor/customers?spotlight=customers-empty-intro',
  },
  'reviews-empty-intro': {
    id: 'reviews-empty-intro',
    targetId: 'reviews-empty-state',
    title: 'รีวิวจากลูกค้า',
    body: 'เมื่อลูกค้าให้คะแนนสินค้า รีวิวจะแสดงที่นี่ — คุณสามารถสรุปคะแนนและตอบกลับได้จากหน้านี้',
    primaryLabel: 'เข้าใจแล้ว',
    catalogTitle: 'แนะนำหน้ารีวิว',
    catalogDescription: 'อธิบายว่ารีวิวมาจากลูกค้าที่ซื้อสินค้า และจุดที่ตอบกลับได้',
    catalogHref: '/vendor/reviews?spotlight=reviews-empty-intro',
  },
  'promotions-empty-add': {
    id: 'promotions-empty-add',
    targetId: 'promotions-add-cta',
    title: 'สร้างโปรโมชันแรก',
    body: 'กดปุ่มนี้เพื่อสร้างโค้ดส่วนลดหรือโปรโมชันของร้าน — ใช้ดึงลูกค้าตอนชำระเงิน',
    primaryLabel: 'ไปสร้างโปรโมชัน',
    catalogTitle: 'สร้างโปรโมชัน',
    catalogDescription: 'ไฮไลต์ปุ่มสร้างโปรโมชันเมื่อยังไม่มีรายการ แล้วพาไปหน้าสร้าง',
    // Hub replay starts the create-promotion action guide (not empty-page intro).
    catalogHref: actionGuideHref('/vendor/promotions/new', 'create-promotion'),
    completeHref: actionGuideHref('/vendor/promotions/new', 'create-promotion'),
  },
  'campaigns-empty-add': {
    id: 'campaigns-empty-add',
    targetId: 'campaigns-add-cta',
    title: 'สร้างแคมเปญแรก',
    body: 'กดปุ่มนี้เพื่อลดราคาสินค้าตาม % บนหน้าร้าน — ต่างจากโปรโมชันที่เป็นโค้ดตอนชำระเงิน',
    primaryLabel: 'ไปสร้างแคมเปญ',
    catalogTitle: 'สร้างแคมเปญ',
    catalogDescription: 'ไฮไลต์ปุ่มสร้างแคมเปญเมื่อยังไม่มีรายการ แล้วพาไปหน้าสร้าง',
    // Hub replay starts the create-campaign action guide (not empty-page intro).
    catalogHref: actionGuideHref('/vendor/campaigns/new', 'create-campaign'),
    completeHref: actionGuideHref('/vendor/campaigns/new', 'create-campaign'),
  },
  'team-invite': {
    id: 'team-invite',
    targetId: 'team-invite-form',
    title: 'เชิญสมาชิกเข้าร้าน',
    body: 'กรอกอีเมลและบทบาท แล้วกดส่งคำเชิญ — ผู้รับต้องตอบรับก่อนจึงจะเข้าร่วมทีม',
    primaryLabel: 'เข้าใจแล้ว',
    catalogTitle: 'เชิญทีมงาน',
    catalogDescription: 'แนะนำฟอร์มเชิญสมาชิกและบทบาท Manager / Staff',
    // Hub replay starts the invite-team action guide (not page intro).
    catalogHref: actionGuideHref('/vendor/team', 'invite-team'),
  },
  'payout-setup': {
    id: 'payout-setup',
    targetId: 'payout-setup-panel',
    title: 'ตั้งบัญชีรับเงิน',
    body: 'บันทึกบัญชีธนาคารและเชื่อม Omise เพื่อรับเงินจากคำสั่งซื้อ — เฉพาะเจ้าของร้าน',
    primaryLabel: 'เข้าใจแล้ว',
    catalogTitle: 'ตั้งค่ารับเงิน',
    catalogDescription: 'แนะนำแผงบัญชีรับเงินและ Omise ในตั้งค่าร้าน',
    // Hub replay starts the setup-payout action guide (not page intro).
    catalogHref: actionGuideHref('/vendor/settings?tab=payout', 'setup-payout'),
  },
  'stores-request': {
    id: 'stores-request',
    targetId: 'stores-request-cta',
    title: 'ขอเปิดร้านใหม่',
    body: 'กดปุ่มนี้เพื่อส่งคำขอเปิดร้าน — เมื่อ Admin อนุมัติ คุณจะจัดการสินค้าและออเดอร์ได้',
    primaryLabel: 'ไปขอเปิดร้าน',
    catalogTitle: 'ขอเปิดร้าน',
    catalogDescription: 'ไฮไลต์ปุ่มขอเปิดร้านใหม่บนหน้าร้านค้าของฉัน',
    // Hub replay starts the request-store action guide (not empty-page intro).
    catalogHref: actionGuideHref('/vendor/stores', 'request-store'),
  },
  'requests-inbox': {
    id: 'requests-inbox',
    targetId: 'requests-invitations-panel',
    title: 'คำเชิญและคำขอ',
    body: 'ตอบรับคำเชิญเข้าร้านที่นี่ และติดตามสถานะคำขอเปิดร้านหรือเปิดใช้งานใหม่ที่คุณส่งไว้',
    primaryLabel: 'เข้าใจแล้ว',
    catalogTitle: 'กล่องคำเชิญ / คำขอ',
    catalogDescription: 'แนะนำหน้ารวมคำเชิญเข้าร้านและคำขอที่รอดำเนินการ',
    catalogHref: '/vendor/requests?spotlight=requests-inbox',
  },
};

export function getPageFeatureSpotlight(
  id: Exclude<FeatureSpotlightId, 'products-empty-add'>,
): PageFeatureSpotlightConfig {
  return PAGE_FEATURE_SPOTLIGHTS[id];
}
