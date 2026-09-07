import { beforeEach, describe, expect, it, vi } from 'vitest';

const { configMock } = vi.hoisted(() => ({
  configMock: vi.fn(),
}));

vi.mock('@monaco-editor/react', () => ({
  loader: {
    config: configMock,
  },
}));

describe('setupMonaco', () => {
  beforeEach(() => {
    configMock.mockClear();
    vi.resetModules();
  });

  it('configures loader paths to same-origin /monaco/vs', async () => {
    const { setupMonaco } = await import('./setup-monaco');
    setupMonaco();
    setupMonaco(); // idempotent

    expect(configMock).toHaveBeenCalledTimes(1);
    expect(configMock).toHaveBeenCalledWith({
      paths: { vs: '/monaco/vs' },
    });
  });
});
