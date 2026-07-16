import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PlatformPromotionListItem } from './platform-promotion-list-item';
import { PlatformPromotionsEmptyState } from './platform-promotions-empty-state';
import type { Promotion } from '@/types';

const basePromo: Promotion = {
  id: 'promo-1',
  code: 'PLATFORM10',
  name: 'ลด 10% แพลตฟอร์ม',
  type: 'percentage',
  scope: 'platform',
  discountValue: 10,
  usagePerCustomer: 1,
  usageCount: 12,
  usageLimit: 500,
  isActive: true,
  autoApply: false,
  priority: 2,
  startsAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2026-12-31T00:00:00.000Z',
};

describe('PlatformPromotionsEmptyState', () => {
  it('teaches the next action with a create CTA', () => {
    render(<PlatformPromotionsEmptyState />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ยังไม่มีโปรโมชันแพลตฟอร์ม' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'สร้างโปรโมชัน' })).toHaveAttribute(
      'href',
      '/admin/promotions/new',
    );
  });
});

describe('PlatformPromotionListItem', () => {
  it('shows unambiguous active status and toggle label', () => {
    render(
      <ul>
        <PlatformPromotionListItem
          promo={basePromo}
          onToggle={vi.fn()}
          onDelete={vi.fn().mockResolvedValue(undefined)}
        />
      </ul>,
    );

    expect(screen.getByLabelText('สถานะ: เปิดใช้งาน')).toHaveTextContent('เปิดใช้งาน');
    expect(screen.getByRole('button', { name: /ปิดใช้งานโปรโมชัน/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('ลำดับ 2')).toBeInTheDocument();
  });

  it('uses coral secondary affordance when inactive can be turned on', () => {
    render(
      <ul>
        <PlatformPromotionListItem
          promo={{ ...basePromo, isActive: false }}
          onToggle={vi.fn()}
          onDelete={vi.fn().mockResolvedValue(undefined)}
        />
      </ul>,
    );

    const toggle = screen.getByRole('button', { name: /เปิดใช้งานโปรโมชัน/ });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle.className).toMatch(/bg-secondary-tint/);
  });

  it('calls onToggle for the row', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <ul>
        <PlatformPromotionListItem
          promo={basePromo}
          onToggle={onToggle}
          onDelete={vi.fn().mockResolvedValue(undefined)}
        />
      </ul>,
    );

    await user.click(screen.getByRole('button', { name: /ปิดใช้งานโปรโมชัน/ }));
    expect(onToggle).toHaveBeenCalledWith(basePromo);
  });

  it('links to the admin edit route', () => {
    render(
      <ul>
        <PlatformPromotionListItem
          promo={basePromo}
          onToggle={vi.fn()}
          onDelete={vi.fn().mockResolvedValue(undefined)}
        />
      </ul>,
    );

    expect(screen.getByRole('link', { name: 'แก้ไข' })).toHaveAttribute(
      'href',
      '/admin/promotions/promo-1/edit',
    );
  });
});
