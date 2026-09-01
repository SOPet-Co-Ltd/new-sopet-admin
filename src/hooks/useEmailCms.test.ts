import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { previewEmailContentTemplate, updateEmailContentTemplate } from '@/lib/api/email-cms';
import { usePreviewEmailContentTemplate, useUpdateEmailContentTemplate } from './useEmailCms';

vi.mock('@/lib/api/email-cms', () => ({
  previewEmailContentTemplate: vi.fn(),
  updateEmailContentTemplate: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('usePreviewEmailContentTemplate', () => {
  it('calls the preview API with the given buffers and never sends production mail', async () => {
    vi.mocked(previewEmailContentTemplate).mockResolvedValue({
      subject: 'หัวข้อทดสอบ',
      html: '<html><body>preview</body></html>',
      text: 'preview',
      missingPlaceholders: [],
      warnings: [],
    });

    const { result } = renderHook(() => usePreviewEmailContentTemplate(), {
      wrapper: createWrapper(),
    });

    const input = {
      key: 'PASSWORD_RESET' as never,
      subjectTemplate: 'รีเซ็ตรหัสผ่าน',
      bodyHtml: '<p>{{resetUrl}}</p>',
      containerId: 'container-1',
      variablesJson: JSON.stringify({ resetUrl: 'https://example.com/reset' }),
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(previewEmailContentTemplate).toHaveBeenCalledWith(input);
    expect(result.current.data?.html).toContain('preview');
  });

  it('surfaces preview errors without throwing unhandled', async () => {
    vi.mocked(previewEmailContentTemplate).mockRejectedValue(new Error('EMAIL_HTML_BLOCKED'));

    const { result } = renderHook(() => usePreviewEmailContentTemplate(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      key: 'ORDER_PAID' as never,
      subjectTemplate: 'สวัสดี',
      bodyHtml: '<script>bad()</script>',
      containerId: 'container-1',
      variablesJson: '{}',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('EMAIL_HTML_BLOCKED');
  });
});

describe('useUpdateEmailContentTemplate', () => {
  it('passes id and input through to the update API', async () => {
    vi.mocked(updateEmailContentTemplate).mockResolvedValue({
      id: 'template-1',
    } as never);

    const { result } = renderHook(() => useUpdateEmailContentTemplate(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: 'template-1',
      input: { subjectTemplate: 'หัวข้อใหม่' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateEmailContentTemplate).toHaveBeenCalledWith('template-1', {
      subjectTemplate: 'หัวข้อใหม่',
    });
  });
});
