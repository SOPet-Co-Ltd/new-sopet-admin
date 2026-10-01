import type { FeatureSpotlightId } from '@/lib/vendor/feature-spotlight';
import { PAGE_FEATURE_SPOTLIGHTS } from '@/lib/vendor/page-feature-spotlights';

export type SpotlightGuideKind = 'shell-tour' | 'page-spotlight';

export type SpotlightGuideId = 'portal-nav' | FeatureSpotlightId;

export type SpotlightGuideDefinition = {
  id: SpotlightGuideId;
  kind: SpotlightGuideKind;
  title: string;
  description: string;
  /** Where to send the user when starting a page spotlight. */
  href?: string;
  featureId?: FeatureSpotlightId;
};

/**
 * Catalog of in-app spotlight guides available from ทัวร์แนะนำ.
 * Add new page spotlights here as they ship across vendor routes.
 */
export const SPOTLIGHT_GUIDES: SpotlightGuideDefinition[] = [
  {
    id: 'portal-nav',
    kind: 'shell-tour',
    title: 'ทัวร์เมนูพอร์ทัลผู้ขาย',
    description:
      'แนะนำเมนูหลักตามบทบาทของคุณ — แดชบอร์ด คำสั่งซื้อ สินค้า การตลาด และเมนูเฉพาะเจ้าของร้าน',
  },
  {
    id: 'products-empty-add',
    kind: 'page-spotlight',
    title: 'เพิ่มสินค้าชิ้นแรก',
    description: 'ไฮไลต์ปุ่มเพิ่มสินค้า แล้วพาไปทัวร์สร้างสินค้าทีละขั้นจนถึง SKU สต็อก และราคา',
    href: '/vendor/products?spotlight=products-empty-add',
    featureId: 'products-empty-add',
  },
  ...Object.values(PAGE_FEATURE_SPOTLIGHTS).map((config): SpotlightGuideDefinition => ({
    id: config.id,
    kind: 'page-spotlight',
    title: config.catalogTitle,
    description: config.catalogDescription,
    href: config.catalogHref,
    featureId: config.id,
  })),
];

export function getSpotlightGuide(id: SpotlightGuideId): SpotlightGuideDefinition | undefined {
  return SPOTLIGHT_GUIDES.find((guide) => guide.id === id);
}
