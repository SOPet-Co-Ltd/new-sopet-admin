import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VendorPromotionListItem } from './vendor-promotion-list-item';
import { VendorPromotionsEmptyState } from './vendor-promotions-empty-state';
import type { Promotion } from '@/types';

const basePromo: Promotion = {
  id: 'promo-1',
  code: 'SAVE10',
  name: 'ลด 10%',
  type: 'percentage',
  scope: 'store',
  discountValue: 10,
  usagePerCustomer: 1,
  usageCount: 3,
  usageLimit: 100,
  isActive: true,
  autoApply: false,
  priority: 0,
  startsAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2026-12-31T00:00:00.000Z',
};

describe('VendorPromotionsEmptyState', () => {
  it('teaches the next action with a create CTA', () => {
    render(<VendorPromotionsEmptyState />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ยังไม่มีโปรโมชัน' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'สร้างโปรโมชัน' })).toHaveAttribute(
      'href',
      '/vendor/promotions/new',
    );
  });

  it('accepts platform copy and create href', () => {
    render(
      <VendorPromotionsEmptyState
        createHref="/admin/promotions/new"
        description="สร้างโปรโมชันระดับแพลตฟอร์ม เพื่อควบคุมส่วนลดทั้งตลาดอย่างชัดเจน"
      />,
    );

    expect(
      screen.getByText('สร้างโปรโมชันระดับแพลตฟอร์ม เพื่อควบคุมส่วนลดทั้งตลาดอย่างชัดเจน'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'สร้างโปรโมชัน' })).toHaveAttribute(
      'href',
      '/admin/promotions/new',
    );
  });
});

describe('VendorPromotionListItem', () => {
  it('shows unambiguous active status and toggle label', () => {
    render(
      <ul>
        <VendorPromotionListItem
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
  });

  it('uses coral secondary affordance when inactive can be turned on', () => {
    render(
      <ul>
        <VendorPromotionListItem
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
        <VendorPromotionListItem
          promo={basePromo}
          onToggle={onToggle}
          onDelete={vi.fn().mockResolvedValue(undefined)}
        />
      </ul>,
    );

    await user.click(screen.getByRole('button', { name: /ปิดใช้งานโปรโมชัน/ }));
    expect(onToggle).toHaveBeenCalledWith(basePromo);
  });

  it('uses editHref for platform admin routes', () => {
    render(
      <ul>
        <VendorPromotionListItem
          promo={basePromo}
          editHref={`/admin/promotions/${basePromo.id}/edit`}
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
