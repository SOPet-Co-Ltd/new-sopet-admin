import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mixedCutoffFours } from '@/app/admin/stores/[id]/store-commission.fixtures';
import { commissionCopy } from '@/lib/i18n/th';
import { formatCurrency } from '@/lib/utils';
import { CommissionBreakdown } from './commission-breakdown';

const AVAILABLE_CAPTIONS = {
  combined: commissionCopy.breakdown.hint.combined,
  shipping: commissionCopy.breakdown.hint.shipping,
};

function renderAvailable(
  overrides?: Partial<{
    productSold: number | null;
    shippingFees: number | null;
    commissionAmount: number | null;
    commissionRate?: number | null;
    netPayable: number | null;
    isLoading: boolean;
    audience: 'admin' | 'vendor';
  }>,
) {
  return render(
    <CommissionBreakdown
      variant="available"
      audience={overrides?.audience ?? 'admin'}
      productSold={overrides?.productSold ?? mixedCutoffFours.productSold}
      shippingFees={overrides?.shippingFees ?? mixedCutoffFours.shippingFees}
      commissionAmount={overrides?.commissionAmount ?? mixedCutoffFours.commissionAmount}
      commissionRate={overrides?.commissionRate ?? 7}
      netPayable={overrides?.netPayable ?? mixedCutoffFours.net}
      captions={AVAILABLE_CAPTIONS}
      isLoading={overrides?.isLoading}
    />,
  );
}

describe('CommissionBreakdown available variant', () => {
  it('renders the four Thai labels in locked order with fixture amounts', () => {
    renderAvailable();

    const product = screen.getByText(commissionCopy.breakdown.productSold);
    const shipping = screen.getByText(commissionCopy.breakdown.shippingFees);
    const commission = screen.getByText(commissionCopy.breakdown.commissionDeducted, {
      exact: false,
    });
    const net = screen.getByText(commissionCopy.breakdown.netPayable.admin);

    expect(
      product.compareDocumentPosition(shipping) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      shipping.compareDocumentPosition(commission) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(commission.compareDocumentPosition(net) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(screen.getByText(formatCurrency(1400))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(80))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(70))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(1410))).toBeInTheDocument();
    expect(screen.getByText(commissionCopy.breakdown.hint.combined)).toBeInTheDocument();
    expect(screen.queryByText(/ก่อนเปิดใช้/)).not.toBeInTheDocument();
    expect(screen.queryByText(/หลังเปิดใช้/)).not.toBeInTheDocument();
    expect(screen.queryByText(commissionCopy.breakdown.hint.frozen)).not.toBeInTheDocument();
  });

  it('uses the vendor net label and shows the commission percent on the deducted row', () => {
    renderAvailable({ audience: 'vendor' });

    expect(screen.getByText(commissionCopy.breakdown.netPayable.vendor)).toBeInTheDocument();
    expect(screen.queryByText(commissionCopy.breakdown.netPayable.admin)).not.toBeInTheDocument();
    expect(screen.getByText(`${commissionCopy.breakdown.commissionDeducted} (7%)`)).toHaveClass(
      'text-danger',
    );
  });

  it('shows a four-row loading skeleton without inventing ฿0.00 commission', () => {
    renderAvailable({ isLoading: true });

    expect(screen.getByText('กำลังโหลดรายละเอียดยอด')).toBeInTheDocument();
    expect(screen.queryByText(formatCurrency(0))).not.toBeInTheDocument();
    expect(screen.queryByText(formatCurrency(70))).not.toBeInTheDocument();
    expect(screen.queryByText(commissionCopy.breakdown.commissionDeducted)).not.toBeInTheDocument();
  });

  it('renders empty-zero as ฿0.00 on all four labeled rows', () => {
    renderAvailable({
      productSold: 0,
      shippingFees: 0,
      commissionAmount: 0,
      netPayable: 0,
    });

    expect(screen.getAllByText(formatCurrency(0))).toHaveLength(4);
    expect(screen.getByText(commissionCopy.breakdown.productSold)).toBeInTheDocument();
    expect(screen.getByText(commissionCopy.breakdown.commissionDeducted, { exact: false })).toBeInTheDocument();
  });
});
