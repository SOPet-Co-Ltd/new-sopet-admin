import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VendorCombobox } from './vendor-combobox';

vi.mock('@/hooks/useAdminVendors', () => ({
  useAdminVendors: vi.fn(),
}));

import { useAdminVendors } from '@/hooks/useAdminVendors';

const mockedUseAdminVendors = vi.mocked(useAdminVendors);

const vendors = [
  { id: 'vendor-1', fullName: 'Alice', email: 'alice@example.com' },
  { id: 'vendor-2', fullName: 'Bob', email: 'bob@example.com' },
];

describe('VendorCombobox', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the selected vendor label when closed', () => {
    mockedUseAdminVendors.mockReturnValue({
      data: vendors,
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminVendors>);

    render(
      <VendorCombobox
        value="vendor-1"
        onChange={vi.fn()}
        initialLabel="Alice — alice@example.com"
      />,
    );

    expect(screen.getByRole('combobox')).toHaveValue('Alice — alice@example.com');
    expect(screen.getByRole('button', { name: 'ล้างผู้ขายที่เลือก' })).toBeInTheDocument();
  });

  it('clears the selected owner when the clear button is clicked', async () => {
    mockedUseAdminVendors.mockReturnValue({
      data: vendors,
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminVendors>);

    const onChange = vi.fn();
    const { rerender } = render(
      <VendorCombobox
        value="vendor-1"
        onChange={onChange}
        initialLabel="Alice — alice@example.com"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'ล้างผู้ขายที่เลือก' }));

    expect(onChange).toHaveBeenCalledWith('');

    rerender(
      <VendorCombobox value="" onChange={onChange} initialLabel="Alice — alice@example.com" />,
    );

    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'ล้างผู้ขายที่เลือก' })).not.toBeInTheDocument();
  });

  it('clears selectedLabel when value becomes empty even if initialLabel stays stale', () => {
    mockedUseAdminVendors.mockReturnValue({
      data: vendors,
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminVendors>);

    const { rerender } = render(
      <VendorCombobox
        value="vendor-1"
        onChange={vi.fn()}
        initialLabel="Alice — alice@example.com"
      />,
    );

    rerender(
      <VendorCombobox value="" onChange={vi.fn()} initialLabel="Alice — alice@example.com" />,
    );

    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('selects a different owner from the dropdown', async () => {
    mockedUseAdminVendors.mockReturnValue({
      data: vendors,
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminVendors>);

    const onChange = vi.fn();
    render(
      <VendorCombobox
        value="vendor-1"
        onChange={onChange}
        initialLabel="Alice — alice@example.com"
      />,
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Bob — bob@example.com' }));

    expect(onChange).toHaveBeenCalledWith('vendor-2');
  });

  it('lists all vendors on focus without using the display label as search', async () => {
    mockedUseAdminVendors.mockReturnValue({
      data: vendors,
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminVendors>);

    render(
      <VendorCombobox
        value="vendor-1"
        onChange={vi.fn()}
        initialLabel="Alice — alice@example.com"
      />,
    );

    await userEvent.click(screen.getByRole('combobox'));

    expect(mockedUseAdminVendors).toHaveBeenCalledWith(undefined, { enabled: true });
    expect(screen.getByRole('option', { name: 'Bob — bob@example.com' })).toBeInTheDocument();
  });

  it('searches vendors after the user edits the input', async () => {
    mockedUseAdminVendors.mockReturnValue({
      data: [vendors[1]],
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminVendors>);

    render(<VendorCombobox value="" onChange={vi.fn()} />);

    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, 'bob');

    await waitFor(() => {
      expect(mockedUseAdminVendors).toHaveBeenCalledWith('bob', { enabled: true });
    });
  });

  it('shows an error message instead of the empty state when loading fails', async () => {
    mockedUseAdminVendors.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: new Error('Unauthorized'),
    } as ReturnType<typeof useAdminVendors>);

    render(<VendorCombobox value="" onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    expect(screen.queryByText('ไม่พบผู้ขาย')).not.toBeInTheDocument();
  });

  it('clears the owner when the search input is emptied', async () => {
    mockedUseAdminVendors.mockReturnValue({
      data: vendors,
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminVendors>);

    const onChange = vi.fn();
    render(
      <VendorCombobox
        value="vendor-1"
        onChange={onChange}
        initialLabel="Alice — alice@example.com"
      />,
    );

    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.clear(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('');
    });
    expect(input).toHaveValue('');
  });

  it('shows validation error styling and message when error is provided', () => {
    mockedUseAdminVendors.mockReturnValue({
      data: vendors,
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminVendors>);

    render(
      <VendorCombobox
        value=""
        onChange={vi.fn()}
        fieldError="กรุณาเลือกเจ้าของร้านค้า"
        aria-invalid
        aria-describedby="ownerId-error"
      />,
    );

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('กรุณาเลือกเจ้าของร้านค้า');
  });
});
