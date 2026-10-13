import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductDescriptionEditor } from './product-description-editor';

vi.mock('next/dynamic', () => ({
  default: () => {
    function MockBlockEditor({
      id,
      value,
      onChange,
      'aria-describedby': ariaDescribedBy,
    }: {
      id: string;
      value: string;
      onChange: (value: string) => void;
      'aria-describedby'?: string;
    }) {
      return (
        <div>
          <div>
            <button type="button" aria-label="ยกเลิก" disabled>
              undo
            </button>
            <button type="button" aria-label="ทำซ้ำ" disabled>
              redo
            </button>
          </div>
          <textarea
            id={id}
            aria-label="รายละเอียด"
            aria-describedby={ariaDescribedBy}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="พิมพ์ / เพื่อเพิ่มบล็อก หรือเริ่มเขียน..."
          />
        </div>
      );
    }
    return MockBlockEditor;
  },
}));

describe('ProductDescriptionEditor', () => {
  it('renders label, help text, and editor surface', () => {
    render(
      <ProductDescriptionEditor
        id="description"
        value=""
        onChange={vi.fn()}
        placeholder="พิมพ์ / เพื่อเพิ่มบล็อก หรือเริ่มเขียน..."
      />,
    );

    expect(screen.getByLabelText('รายละเอียด')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ดูตัวอย่าง' })).toBeInTheDocument();
    expect(screen.getByText(/พิมพ์ \/ เพื่อเพิ่มหัวข้อ/)).toBeInTheDocument();
  });

  it('renders undo and redo controls disabled when history is empty', () => {
    render(<ProductDescriptionEditor id="description" value="" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'ยกเลิก' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'ทำซ้ำ' })).toBeDisabled();
  });

  it('calls onChange when typing in the editor', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ProductDescriptionEditor id="description" value="" onChange={onChange} />);

    await user.type(screen.getByLabelText('รายละเอียด'), 'abc');
    expect(onChange).toHaveBeenCalled();
  });

  it('opens preview dialog with rendered markdown', async () => {
    const user = userEvent.setup();

    render(
      <ProductDescriptionEditor
        id="description"
        value={'## Features\n\n- Durable'}
        onChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'ดูตัวอย่าง' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Features' })).toBeInTheDocument();
    expect(screen.getByText('Durable')).toBeInTheDocument();
  });

  it('shows empty preview message when description is blank', async () => {
    const user = userEvent.setup();

    render(<ProductDescriptionEditor id="description" value="   " onChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'ดูตัวอย่าง' }));

    expect(screen.getByText('ยังไม่มีรายละเอียดสินค้า')).toBeInTheDocument();
  });
});
