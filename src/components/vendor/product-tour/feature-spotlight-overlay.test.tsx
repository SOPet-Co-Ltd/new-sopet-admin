import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FeatureSpotlightOverlay } from './feature-spotlight-overlay';

Element.prototype.scrollIntoView = vi.fn();

describe('FeatureSpotlightOverlay', () => {
  it('highlights copy and dismisses via primary / skip', async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();
    const onSkip = vi.fn();

    document.body.innerHTML = '<button data-tour-id="products-add-cta">เพิ่มสินค้า</button>';

    const { unmount } = render(
      <FeatureSpotlightOverlay
        targetId="products-add-cta"
        title="เพิ่มสินค้าชิ้นแรก"
        body="กดปุ่มนี้เพื่อสร้างสินค้า"
        onPrimary={onPrimary}
        onSkip={onSkip}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('เพิ่มสินค้าชิ้นแรก')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'เข้าใจแล้ว' }));
    expect(onPrimary).toHaveBeenCalledOnce();
    unmount();

    render(
      <FeatureSpotlightOverlay
        targetId="products-add-cta"
        title="เพิ่มสินค้าชิ้นแรก"
        body="กดปุ่มนี้เพื่อสร้างสินค้า"
        onPrimary={onPrimary}
        onSkip={onSkip}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'ข้าม' }));
    expect(onSkip).toHaveBeenCalledOnce();
  });
});
