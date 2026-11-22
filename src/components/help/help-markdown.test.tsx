import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HelpMarkdown } from './help-markdown';

describe('HelpMarkdown', () => {
  it('renders help screenshots as figures with captions', () => {
    const { container } = render(
      <HelpMarkdown content={'## ตัวอย่าง\n\n![หน้ารายการสินค้า](/help/vendor/products.png)\n'} />,
    );

    const image = screen.getByRole('img', { name: 'หน้ารายการสินค้า' });
    expect(image).toHaveAttribute('src', '/help/vendor/products.png');
    expect(screen.getByText('ภาพหน้าจอ')).toBeInTheDocument();
    expect(screen.getAllByText('หน้ารายการสินค้า').length).toBeGreaterThanOrEqual(1);

    const figure = container.querySelector('figure');
    expect(figure).not.toBeNull();
    expect(figure?.closest('p')).toBeNull();
  });
});
