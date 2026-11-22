import { describe, expect, it } from 'vitest';
import { SPOTLIGHT_GUIDES, getSpotlightGuide } from './spotlight-guides';
import { PAGE_FEATURE_SPOTLIGHTS } from './page-feature-spotlights';

describe('spotlight-guides catalog', () => {
  it('includes portal nav, products, and all page feature spotlights', () => {
    const ids = SPOTLIGHT_GUIDES.map((guide) => guide.id);
    expect(ids).toContain('portal-nav');
    expect(ids).toContain('products-empty-add');
    for (const id of Object.keys(PAGE_FEATURE_SPOTLIGHTS)) {
      expect(ids).toContain(id);
    }
    expect(getSpotlightGuide('campaigns-empty-add')?.href).toContain('guide=create-campaign');
    expect(getSpotlightGuide('promotions-empty-add')?.href).toContain('guide=create-promotion');
    expect(getSpotlightGuide('team-invite')?.href).toContain('guide=invite-team');
    expect(getSpotlightGuide('stores-request')?.href).toContain('guide=request-store');
    expect(getSpotlightGuide('payout-setup')?.href).toContain('guide=setup-payout');
  });
});
