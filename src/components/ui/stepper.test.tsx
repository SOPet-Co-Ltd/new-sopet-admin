import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Stepper } from './stepper';

const steps = [
  { label: 'ข้อมูลพื้นฐาน' },
  { label: 'การจัดหมวดหมู่' },
  { label: 'ตัวเลือกสินค้า' },
];

describe('Stepper', () => {
  it('marks the current step and leaves later steps upcoming', () => {
    render(<Stepper steps={steps} currentStep={2} />);

    const current = screen.getByText('การจัดหมวดหมู่');
    expect(current).toHaveAttribute('aria-current', 'step');

    const upcoming = screen.getByText('ตัวเลือกสินค้า');
    expect(upcoming).not.toHaveAttribute('aria-current');
  });

  it('renders every step label in order', () => {
    render(<Stepper steps={steps} currentStep={1} />);

    for (const step of steps) {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    }
  });
});
