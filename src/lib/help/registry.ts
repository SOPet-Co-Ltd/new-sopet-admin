import type { HelpArticleMeta, HelpRole } from './types';

const adminArticles: HelpArticleMeta[] = [
  {
    slug: 'index',
    title: 'ภาพรวมคู่มือผู้ดูแลระบบ',
    section: 'เริ่มต้น',
    role: 'admin',
    order: 0,
    description: 'แนะนำพอร์ทัลผู้ดูแลระบบ SOPet และวิธีใช้คู่มือนี้',
    file: 'admin/index.md',
  },
  {
    slug: 'getting-started',
    title: 'เริ่มต้นใช้งานและเข้าสู่ระบบ',
    section: 'เริ่มต้น',
    role: 'admin',
    order: 1,
    description: 'เข้าสู่ระบบ รีเซ็ตรหัสผ่าน และรับคำเชิญทีมผู้ดูแล',
    file: 'admin/getting-started.md',
  },
  {
    slug: 'analytics',
    title: 'ภาพรวม (Analytics)',
    section: 'ภาพรวม',
    role: 'admin',
    order: 10,
    description: 'ดูตัวชี้วัดยอดขาย คำสั่งซื้อ และประสิทธิภาพร้านค้า',
    file: 'admin/analytics.md',
  },
  {
    slug: 'stores',
    title: 'จัดการร้านค้า',
    section: 'จัดการ',
    role: 'admin',
    order: 20,
    description: 'ค้นหา อนุมัติ สร้าง และตั้งค่าร้านค้า รวมคอมมิชชัน',
    file: 'admin/stores.md',
  },
  {
    slug: 'vendors',
    title: 'จัดการผู้ขาย',
    section: 'จัดการ',
    role: 'admin',
    order: 21,
    description: 'ดูบัญชีผู้ขาย ยืนยันอีเมล และรีเซ็ตรหัสผ่าน',
    file: 'admin/vendors.md',
  },
  {
    slug: 'customers',
    title: 'จัดการลูกค้า',
    section: 'จัดการ',
    role: 'admin',
    order: 22,
    description: 'ดูบัญชีลูกค้าแพลตฟอร์มและประวัติคำสั่งซื้อ',
    file: 'admin/customers.md',
  },
  {
    slug: 'requests',
    title: 'ศูนย์คำขอ',
    section: 'คำขอ',
    role: 'admin',
    order: 30,
    description: 'อนุมัติคำขอเปิดร้าน และเชิญผู้ขายใหม่',
    file: 'admin/requests.md',
  },
  {
    slug: 'reactivation-requests',
    title: 'เปิดใช้งานร้าน (Reactivation)',
    section: 'คำขอ',
    role: 'admin',
    order: 31,
    description: 'พิจารณาคำขอเปิดร้านที่ถูกระงับอีกครั้ง',
    file: 'admin/reactivation-requests.md',
  },
  {
    slug: 'imported-reviews',
    title: 'รีวิวนำเข้า',
    section: 'คำขอ',
    role: 'admin',
    order: 32,
    description: 'อนุมัติรีวิวที่นำเข้าผ่าน Vendor API',
    file: 'admin/imported-reviews.md',
  },
  {
    slug: 'bank-transfers',
    title: 'โอนเงินเข้าบัญชี',
    section: 'คำขอ',
    role: 'admin',
    order: 33,
    description: 'ยืนยันการชำระเงินแบบโอนธนาคารของลูกค้า',
    file: 'admin/bank-transfers.md',
  },
  {
    slug: 'manual-payouts',
    title: 'Payout Manual',
    section: 'คำขอ',
    role: 'admin',
    order: 34,
    description: 'อนุมัติหรือปฏิเสธคำขอรับเงินแบบ Manual ของร้านค้า',
    file: 'admin/manual-payouts.md',
  },
  {
    slug: 'promotions',
    title: 'โปรโมชันแพลตฟอร์ม',
    section: 'การตลาด',
    role: 'admin',
    order: 40,
    description: 'สร้างและจัดการโค้ดส่วนลดระดับแพลตฟอร์ม',
    file: 'admin/promotions.md',
  },
  {
    slug: 'taxonomy',
    title: 'หมวดหมู่และแท็ก',
    section: 'การตลาด',
    role: 'admin',
    order: 41,
    description: 'จัดการหมวดหมู่ แท็ก ประเภทสัตว์เลี้ยง แบรนด์ และคิวรออนุมัติ',
    file: 'admin/taxonomy.md',
  },
  {
    slug: 'shipping',
    title: 'การจัดส่ง',
    section: 'การตลาด',
    role: 'admin',
    order: 42,
    description: 'ตั้งค่าผู้ให้บริการจัดส่งและตัวเลือกร้านค้า',
    file: 'admin/shipping.md',
  },
  {
    slug: 'search-synonyms',
    title: 'คำพ้องความหมาย (Search)',
    section: 'การค้นหา',
    role: 'admin',
    order: 50,
    description: 'จัดการคำพ้องสำหรับ Smart Search',
    file: 'admin/search-synonyms.md',
  },
  {
    slug: 'search-tuning',
    title: 'ปรับการจัดอันดับการค้นหา',
    section: 'การค้นหา',
    role: 'admin',
    order: 51,
    description: 'ปรับน้ำหนักคะแนนการจัดอันดับผลค้นหา',
    file: 'admin/search-tuning.md',
  },
  {
    slug: 'search-analytics',
    title: 'วิเคราะห์การค้นหา',
    section: 'การค้นหา',
    role: 'admin',
    order: 52,
    description: 'ดูคำค้นยอดนิยม คำที่ไม่มีผลลัพธ์ และ CTR',
    file: 'admin/search-analytics.md',
  },
  {
    slug: 'email-templates',
    title: 'เทมเพลตอีเมล',
    section: 'ระบบ',
    role: 'admin',
    order: 60,
    description: 'แก้ไขเทมเพลตอีเมลธุรกรรมของระบบ',
    file: 'admin/email-templates.md',
  },
  {
    slug: 'email-containers',
    title: 'คอนเทนเนอร์อีเมล',
    section: 'ระบบ',
    role: 'admin',
    order: 61,
    description: 'จัดการส่วนหัว/ท้ายอีเมลที่ใช้ร่วมกัน',
    file: 'admin/email-containers.md',
  },
  {
    slug: 'audit-logs',
    title: 'บันทึกการใช้งาน',
    section: 'บัญชี',
    role: 'admin',
    order: 70,
    description: 'ตรวจสอบประวัติการดำเนินการของผู้ดูแลระบบ',
    file: 'admin/audit-logs.md',
  },
  {
    slug: 'notifications',
    title: 'การแจ้งเตือน',
    section: 'บัญชี',
    role: 'admin',
    order: 71,
    description: 'อ่านและจัดการการแจ้งเตือนในระบบ',
    file: 'admin/notifications.md',
  },
  {
    slug: 'settings',
    title: 'ตั้งค่าแพลตฟอร์ม',
    section: 'บัญชี',
    role: 'admin',
    order: 72,
    description: 'แบนเนอร์ สปอนเซอร์ โฆษณา รูปเข้าสู่ระบบ บัญชีรับโอน และโหมดปิดปรับปรุง',
    file: 'admin/settings.md',
  },
  {
    slug: 'team',
    title: 'ทีมผู้ดูแล',
    section: 'บัญชี',
    role: 'admin',
    order: 73,
    description: 'เชิญ เปิด/ปิดใช้งาน และจัดการทีมผู้ดูแลระบบ',
    file: 'admin/team.md',
  },
  {
    slug: 'profile',
    title: 'โปรไฟล์',
    section: 'บัญชี',
    role: 'admin',
    order: 74,
    description: 'แก้ไขชื่อและรหัสผ่านบัญชีผู้ดูแล',
    file: 'admin/profile.md',
  },
  {
    slug: 'errors-message',
    title: 'รหัสข้อผิดพลาด',
    section: 'บัญชี',
    role: 'admin',
    order: 75,
    description: 'ค้นหารหัสข้อผิดพลาดและข้อความภาษาไทยสำหรับซัพพอร์ต',
    file: 'admin/errors-message.md',
  },
  {
    slug: 'appendix-statuses',
    title: 'ภาคผนวก: สถานะและความหมาย',
    section: 'ภาคผนวก',
    role: 'admin',
    order: 90,
    description: 'ตารางสถานะคำสั่งซื้อ ร้านค้า การชำระเงิน และอื่นๆ',
    file: 'admin/appendix-statuses.md',
  },
  {
    slug: 'glossary',
    title: 'อภิธานศัพท์',
    section: 'ภาคผนวก',
    role: 'admin',
    order: 91,
    description: 'คำศัพท์ที่ใช้ในระบบ SOPet',
    file: 'shared/glossary.md',
  },
];

const vendorArticles: HelpArticleMeta[] = [
  {
    slug: 'index',
    title: 'ภาพรวมคู่มือผู้ขาย',
    section: 'เริ่มต้น',
    role: 'vendor',
    order: 0,
    description: 'แนะนำพอร์ทัลผู้ขาย SOPet และวิธีใช้คู่มือนี้',
    file: 'vendor/index.md',
  },
  {
    slug: 'getting-started',
    title: 'เริ่มต้นใช้งานและสมัครบัญชี',
    section: 'เริ่มต้น',
    role: 'vendor',
    order: 1,
    description: 'สมัคร ยืนยันอีเมล เข้าสู่ระบบ และขอเปิดร้าน',
    file: 'vendor/getting-started.md',
  },
  {
    slug: 'invites-and-roles',
    title: 'คำเชิญและบทบาทในร้าน',
    section: 'เริ่มต้น',
    role: 'vendor',
    order: 2,
    description: 'รับคำเชิญเข้าทีม และสิทธิ์ของเจ้าของ / ผู้จัดการ / พนักงาน',
    file: 'vendor/invites-and-roles.md',
  },
  {
    slug: 'dashboard',
    title: 'แดชบอร์ด',
    section: 'ร้านค้า',
    role: 'vendor',
    order: 10,
    description: 'งานวันนี้ รายการที่ต้องทำ และสรุปยอด',
    file: 'vendor/dashboard.md',
  },
  {
    slug: 'stores',
    title: 'ร้านค้าของฉัน',
    section: 'ร้านค้า',
    role: 'vendor',
    order: 11,
    description: 'สลับร้าน ขอเปิดร้านใหม่ และเสนอหมวดหมู่/แบรนด์',
    file: 'vendor/stores.md',
  },
  {
    slug: 'requests',
    title: 'คำเชิญ / คำขอ',
    section: 'ร้านค้า',
    role: 'vendor',
    order: 12,
    description: 'ดูสถานะคำเชิญทีม คำขอเปิดร้าน และการเปิดใช้งานใหม่',
    file: 'vendor/requests.md',
  },
  {
    slug: 'orders',
    title: 'คำสั่งซื้อ',
    section: 'ขาย',
    role: 'vendor',
    order: 20,
    description: 'คิวงาน กรองสถานะ จัดเตรียม และจัดส่งคำสั่งซื้อ',
    file: 'vendor/orders.md',
  },
  {
    slug: 'products',
    title: 'สินค้า ตัวเลือก และสต็อก',
    section: 'ขาย',
    role: 'vendor',
    order: 21,
    description: 'สร้าง แก้ไข ตัวแปรสินค้า (variants) และจัดการสต็อก',
    file: 'vendor/products.md',
  },
  {
    slug: 'customers',
    title: 'ลูกค้า',
    section: 'ขาย',
    role: 'vendor',
    order: 22,
    description: 'ดูลูกค้าที่เคยสั่งซื้อจากร้านและประวัติออเดอร์',
    file: 'vendor/customers.md',
  },
  {
    slug: 'reviews',
    title: 'รีวิว',
    section: 'ขาย',
    role: 'vendor',
    order: 23,
    description: 'ดูรีวิวสินค้าและตอบกลับลูกค้า',
    file: 'vendor/reviews.md',
  },
  {
    slug: 'promotions',
    title: 'โปรโมชัน',
    section: 'การตลาด',
    role: 'vendor',
    order: 30,
    description: 'สร้างโค้ดส่วนลดตอนชำระเงินของร้าน',
    file: 'vendor/promotions.md',
  },
  {
    slug: 'campaigns',
    title: 'แคมเปญ',
    section: 'การตลาด',
    role: 'vendor',
    order: 31,
    description: 'ลดราคาสินค้าที่แสดงบนหน้าร้าน (ต่างจากโปรโมชัน)',
    file: 'vendor/campaigns.md',
  },
  {
    slug: 'team',
    title: 'ทีมงาน',
    section: 'ทีม',
    role: 'vendor',
    order: 40,
    description: 'เชิญสมาชิกและเปลี่ยนบทบาท (เจ้าของร้านเท่านั้น)',
    file: 'vendor/team.md',
  },
  {
    slug: 'api',
    title: 'API',
    section: 'ระบบ',
    role: 'vendor',
    order: 50,
    description: 'สร้างคีย์ API และลิงก์ไปเอกสาร REST แบบละเอียด',
    file: 'vendor/api.md',
  },
  {
    slug: 'payout',
    title: 'รับเงิน',
    section: 'บัญชี',
    role: 'vendor',
    order: 60,
    description: 'ตั้งบัญชีรับเงิน ดูยอดคงเหลือ และขอรับเงิน (เจ้าของร้าน)',
    file: 'vendor/payout.md',
  },
  {
    slug: 'shipping-settings',
    title: 'ตั้งค่าการจัดส่งของร้าน',
    section: 'บัญชี',
    role: 'vendor',
    order: 61,
    description: 'เปิด/ปิดตัวเลือกการจัดส่งของร้าน',
    file: 'vendor/shipping-settings.md',
  },
  {
    slug: 'settings',
    title: 'ตั้งค่าบัญชีและร้าน',
    section: 'บัญชี',
    role: 'vendor',
    order: 62,
    description: 'โปรไฟล์ผู้ใช้ รหัสผ่าน และข้อมูลร้านค้า',
    file: 'vendor/settings.md',
  },
  {
    slug: 'notifications',
    title: 'การแจ้งเตือน',
    section: 'บัญชี',
    role: 'vendor',
    order: 63,
    description: 'อ่านการแจ้งเตือนคำสั่งซื้อ ร้านค้า และสถานะพักดำเนินการ',
    file: 'vendor/notifications.md',
  },
  {
    slug: 'reactivation',
    title: 'ขอเปิดใช้งานร้านที่ถูกระงับ',
    section: 'บัญชี',
    role: 'vendor',
    order: 64,
    description: 'ส่งคำขอเปิดร้านอีกครั้งเมื่อร้านถูกระงับ',
    file: 'vendor/reactivation.md',
  },
  {
    slug: 'appendix-statuses',
    title: 'ภาคผนวก: สถานะและความหมาย',
    section: 'ภาคผนวก',
    role: 'vendor',
    order: 90,
    description: 'ตารางสถานะคำสั่งซื้อ สินค้า ร้านค้า และการชำระเงิน',
    file: 'vendor/appendix-statuses.md',
  },
  {
    slug: 'glossary',
    title: 'อภิธานศัพท์',
    section: 'ภาคผนวก',
    role: 'vendor',
    order: 91,
    description: 'คำศัพท์ที่ใช้ในระบบ SOPet',
    file: 'shared/glossary.md',
  },
];

export const HELP_ARTICLES: HelpArticleMeta[] = [...adminArticles, ...vendorArticles];

export function getHelpArticles(role: HelpRole): HelpArticleMeta[] {
  return HELP_ARTICLES.filter((article) => article.role === role).sort((a, b) => a.order - b.order);
}

export function getHelpArticle(role: HelpRole, slug: string): HelpArticleMeta | undefined {
  return getHelpArticles(role).find((article) => article.slug === slug);
}

export function getHelpSections(
  role: HelpRole,
): { section: string; articles: HelpArticleMeta[] }[] {
  const articles = getHelpArticles(role);
  const sectionOrder: string[] = [];
  const bySection = new Map<string, HelpArticleMeta[]>();

  for (const article of articles) {
    if (!bySection.has(article.section)) {
      sectionOrder.push(article.section);
      bySection.set(article.section, []);
    }
    bySection.get(article.section)!.push(article);
  }

  return sectionOrder.map((section) => ({
    section,
    articles: bySection.get(section)!,
  }));
}

export function getAdjacentArticles(
  role: HelpRole,
  slug: string,
): { prev: HelpArticleMeta | null; next: HelpArticleMeta | null } {
  const articles = getHelpArticles(role);
  const index = articles.findIndex((article) => article.slug === slug);
  if (index < 0) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? articles[index - 1]! : null,
    next: index < articles.length - 1 ? articles[index + 1]! : null,
  };
}

/** Public official guidebook base (no auth required). */
export function helpBasePath(role: HelpRole): string {
  return role === 'admin' ? '/guide/admin' : '/guide/vendor';
}

export function helpArticleHref(role: HelpRole, slug: string): string {
  return `${helpBasePath(role)}/${slug}`;
}

/** Hub for choosing admin vs vendor guidebooks. */
export const GUIDE_HUB_PATH = '/guide';
