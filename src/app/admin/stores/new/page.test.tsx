import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdminStoreNewPage from './page';

const mutateAsync = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/useAdminStores', () => ({
  useCreateStoreAsAdmin: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/components/admin/vendor-combobox', () => ({
  VendorCombobox: ({
    fieldError,
    'aria-invalid': ariaInvalid,
  }: {
    fieldError?: string;
    'aria-invalid'?: boolean;
  }) => (
    <div>
      <input id="ownerId" aria-invalid={ariaInvalid} readOnly aria-label="เจ้าของร้านค้า" />
      {fieldError ? (
        <p id="ownerId-error" role="alert">
          {fieldError}
        </p>
      ) : null}
    </div>
  ),
}));

describe('AdminStoreNewPage', () => {
  it('shows required owner validation error on submit without selecting owner', async () => {
    render(<AdminStoreNewPage />);

    await userEvent.type(screen.getByLabelText(/ชื่อร้านค้า/), 'Pet Shop');
    await userEvent.click(screen.getByRole('button', { name: 'สร้างร้านค้า' }));

    expect(screen.getByRole('alert')).toHaveTextContent('กรุณาเลือกเจ้าของร้านค้า');
    expect(screen.getByLabelText('เจ้าของร้านค้า')).toHaveAttribute('aria-invalid', 'true');
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('shows a clear Thai error when an email is typed into contactPhone', async () => {
    render(<AdminStoreNewPage />);

    await userEvent.type(screen.getByLabelText(/ชื่อร้านค้า/), 'Pet Shop');
    await userEvent.type(screen.getByLabelText('เบอร์โทร'), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'สร้างร้านค้า' }));

    expect(screen.getByText('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง')).toBeInTheDocument();
    expect(screen.getByLabelText('เบอร์โทร')).toHaveAttribute('aria-invalid', 'true');
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('does not render a commission rate field (AC-F-003c)', () => {
    render(<AdminStoreNewPage />);

    expect(screen.queryByLabelText(/อัตราค่าคอมมิชชัน/)).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByText(/ค่าเริ่มต้นของแพลตฟอร์มคือ 7%/)).not.toBeInTheDocument();
    expect(document.querySelector('#commissionRate')).toBeNull();
    expect(document.querySelector('[name="commissionRate"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'สร้างร้านค้า' })).toBeInTheDocument();
  });
});
