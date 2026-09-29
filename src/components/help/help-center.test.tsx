import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HelpCenter } from './help-center';
import { HelpIndex } from './help-index';
import { getHelpArticle } from '@/lib/help/registry';

describe('HelpIndex', () => {
  it('lists sections and filters by search', async () => {
    const user = userEvent.setup();
    render(<HelpIndex role="vendor" title="คู่มือการใช้งานผู้ขาย" description="คำอธิบาย" />);

    expect(screen.getByTestId('help-index')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ขาย' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'คำสั่งซื้อ คิวงาน กรองสถานะ จัดเตรียม และจัดส่งคำสั่งซื้อ',
      }),
    ).toHaveAttribute('href', '/guide/vendor/orders');

    await user.type(screen.getByLabelText('ค้นหาหัวข้อในคู่มือ'), 'รับเงิน');
    expect(screen.getByRole('link', { name: /รับเงิน/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'คำสั่งซื้อ คิวงาน กรองสถานะ จัดเตรียม และจัดส่งคำสั่งซื้อ',
      }),
    ).not.toBeInTheDocument();
  });
});

describe('HelpCenter', () => {
  it('renders markdown, breadcrumb, and prev/next links without a nested sidebar', () => {
    const article = getHelpArticle('vendor', 'orders');
    expect(article).toBeDefined();

    render(
      <HelpCenter
        role="vendor"
        article={article!}
        markdown={'# คำสั่งซื้อ\n\nเนื้อหาทดสอบคู่มือ'}
      />,
    );

    expect(screen.getByTestId('help-center')).toBeInTheDocument();
    expect(screen.getByTestId('help-markdown')).toHaveTextContent('เนื้อหาทดสอบคู่มือ');
    expect(screen.getByRole('heading', { level: 1, name: 'คำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'เส้นทางคู่มือ' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'สารบัญคู่มือ' })).not.toBeInTheDocument();
    expect(screen.getByText('ก่อนหน้า')).toBeInTheDocument();
    expect(screen.getByText('ถัดไป')).toBeInTheDocument();
  });
});
