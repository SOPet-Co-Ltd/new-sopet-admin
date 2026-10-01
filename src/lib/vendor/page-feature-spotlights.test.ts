import { describe, expect, it } from 'vitest';
import { PAGE_FEATURE_SPOTLIGHTS, getPageFeatureSpotlight } from './page-feature-spotlights';

describe('page-feature-spotlights', () => {
  it('defines targets and catalog hrefs for each page guide', () => {
    expect(Object.keys(PAGE_FEATURE_SPOTLIGHTS).sort()).toEqual(
      [
        'campaigns-empty-add',
        'customers-empty-intro',
        'payout-setup',
        'promotions-empty-add',
        'requests-inbox',
        'reviews-empty-intro',
        'stores-request',
        'team-invite',
      ].sort(),
    );
    expect(getPageFeatureSpotlight('promotions-empty-add').completeHref).toBe(
      '/vendor/promotions/new?guide=create-promotion',
    );
    expect(getPageFeatureSpotlight('promotions-empty-add').catalogHref).toBe(
      '/vendor/promotions/new?guide=create-promotion',
    );
    expect(getPageFeatureSpotlight('campaigns-empty-add').completeHref).toBe(
      '/vendor/campaigns/new?guide=create-campaign',
    );
    expect(getPageFeatureSpotlight('campaigns-empty-add').catalogHref).toBe(
      '/vendor/campaigns/new?guide=create-campaign',
    );
    expect(getPageFeatureSpotlight('team-invite').catalogHref).toBe(
      '/vendor/team?guide=invite-team',
    );
    expect(getPageFeatureSpotlight('stores-request').targetId).toBe('stores-request-cta');
    expect(getPageFeatureSpotlight('stores-request').catalogHref).toBe(
      '/vendor/stores?guide=request-store',
    );
    expect(getPageFeatureSpotlight('payout-setup').catalogHref).toBe(
      '/vendor/settings?tab=payout&guide=setup-payout',
    );
  });
});
