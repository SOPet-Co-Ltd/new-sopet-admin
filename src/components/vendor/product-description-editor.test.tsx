import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductDescriptionEditor } from './product-description-editor';

describe('ProductDescriptionEditor', () => {
  it('renders label, toolbar, and textarea', () => {
    render(
      <ProductDescriptionEditor
        id="description"
        value=""
        onChange={vi.fn()}
        placeholder="อธิบายสินค้า..."
      />,
    );

    expect(screen.getByLabelText('รายละเอียด')).toBeInTheDocument();
    expect(
      screen.getByRole('toolbar', { name: 'เครื่องมือจัดรูปแบบ Markdown' }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('อธิบายสินค้า...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ดูตัวอย่าง' })).toBeInTheDocument();
  });

  it('calls onChange when typing in the textarea', async () => {
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

  it('inserts bold markdown via toolbar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ProductDescriptionEditor id="description" value="" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'ตัวหนา' }));

    expect(onChange).toHaveBeenCalledWith('**ข้อความ**');
  });
});
