import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';

describe('ConfirmDeleteDialog', () => {
  it('shows generic-delete DialogDescription when dialogDescription is omitted', () => {
    render(
      <ConfirmDeleteDialog
        open
        onOpenChange={vi.fn()}
        title="ลบแบนเนอร์"
        confirmLabel="Summer Sale"
        onConfirm={async () => undefined}
      />,
    );

    expect(screen.getByText('การลบ "Summer Sale" ไม่สามารถย้อนกลับได้')).toBeInTheDocument();
  });

  it('replaces generic-delete copy when dialogDescription is set', () => {
    render(
      <ConfirmDeleteDialog
        open
        onOpenChange={vi.fn()}
        title="ล้างรูปเดสก์ท็อป?"
        confirmLabel="ล้างรูป"
        dialogDescription="การล้างรูปเดสก์ท็อปจะล้างรูปมือถือด้วย และตั้งค่าจะว่างทั้งหมด"
        onConfirm={async () => undefined}
      />,
    );

    expect(
      screen.getByText('การล้างรูปเดสก์ท็อปจะล้างรูปมือถือด้วย และตั้งค่าจะว่างทั้งหมด'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/การลบ ".* ไม่สามารถย้อนกลับได้/)).not.toBeInTheDocument();
  });

  it('uses confirmPendingLabel while deleting', () => {
    render(
      <ConfirmDeleteDialog
        open
        onOpenChange={vi.fn()}
        title="ล้างรูปเดสก์ท็อป?"
        confirmLabel="ล้างรูป"
        confirmButtonLabel="ล้างรูป"
        confirmPendingLabel="กำลังล้าง..."
        isDeleting
        onConfirm={async () => undefined}
      />,
    );

    expect(screen.getByRole('button', { name: 'กำลังล้าง...' })).toBeInTheDocument();
  });

  it('uses errorFallbackMessage instead of default ลบไม่สำเร็จ', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDeleteDialog
        open
        onOpenChange={vi.fn()}
        title="ล้างรูปเดสก์ท็อป?"
        confirmLabel="ล้างรูป"
        confirmButtonLabel="ล้างรูป"
        errorFallbackMessage="ล้างรูปไม่สำเร็จ"
        onConfirm={async () => {
          throw new Error('network');
        }}
      />,
    );

    await user.type(screen.getByLabelText(/พิมพ์ "ล้างรูป" เพื่อยืนยัน/), 'ล้างรูป');
    await user.click(screen.getByRole('button', { name: 'ล้างรูป' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ล้างรูปไม่สำเร็จ');
    expect(screen.queryByText('ลบไม่สำเร็จ')).not.toBeInTheDocument();
  });
});
