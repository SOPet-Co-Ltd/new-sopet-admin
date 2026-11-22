import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SpotlightOverlay } from './spotlight-overlay';
import type { ProductTourStep } from '@/lib/vendor/product-tour';

const baseStep: ProductTourStep = {
  id: 'orders',
  targetId: null,
  title: 'คำสั่งซื้อ',
  body: 'คิวงานหลักของร้าน',
  roles: ['staff', 'manager', 'owner'],
};

describe('SpotlightOverlay', () => {
  it('renders step copy and advances on next', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(
      <SpotlightOverlay
        step={baseStep}
        stepIndex={0}
        stepCount={3}
        onNext={onNext}
        onBack={vi.fn()}
        onSkip={vi.fn()}
        onFinish={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('คำสั่งซื้อ')).toBeInTheDocument();
    expect(screen.getByText('ทัวร์แนะนำ · 1/3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ถัดไป' }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('persists skip via onSkip and finishes on last step', async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    const onFinish = vi.fn();
    const { rerender } = render(
      <SpotlightOverlay
        step={baseStep}
        stepIndex={0}
        stepCount={2}
        onNext={vi.fn()}
        onBack={vi.fn()}
        onSkip={onSkip}
        onFinish={onFinish}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'ข้าม' }));
    expect(onSkip).toHaveBeenCalledOnce();

    rerender(
      <SpotlightOverlay
        step={{ ...baseStep, id: 'help', title: 'คู่มือ' }}
        stepIndex={1}
        stepCount={2}
        onNext={vi.fn()}
        onBack={vi.fn()}
        onSkip={onSkip}
        onFinish={onFinish}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'เสร็จสิ้น' }));
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it('shows owner next-action links', () => {
    render(
      <SpotlightOverlay
        step={{
          id: 'owner-next',
          targetId: null,
          title: 'ควรทำอะไรต่อ',
          body: 'ตั้งค่าร้าน',
          roles: ['owner'],
          kind: 'next-actions',
        }}
        stepIndex={0}
        stepCount={1}
        readiness={{
          items: [
            { key: 'shipping', complete: false, href: '/vendor/settings?tab=shipping' },
            { key: 'publishedProduct', complete: true, href: '/vendor/products' },
            { key: 'payout', complete: false, href: '/vendor/settings?tab=payout' },
          ],
          completedCount: 1,
          allComplete: false,
        }}
        onNext={vi.fn()}
        onBack={vi.fn()}
        onSkip={vi.fn()}
        onFinish={vi.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'ไปตั้งค่าการจัดส่ง' })).toHaveAttribute(
      'href',
      '/vendor/settings?tab=shipping',
    );
    expect(screen.getByRole('link', { name: 'ไปทีมงาน' })).toBeInTheDocument();
  });
});
