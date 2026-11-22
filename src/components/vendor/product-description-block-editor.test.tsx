import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const undoCommand = vi.fn();
const redoCommand = vi.fn();
const undo = vi.fn(() => true);
const redo = vi.fn(() => true);
const canExec = vi.fn((command: unknown) => command === undoCommand);
const getExtension = vi.fn((key: string) => {
  if (key === 'history') {
    return { undoCommand, redoCommand };
  }
  return undefined;
});
const onChange = vi.fn((cb: () => void) => {
  // no live edits in this unit test
  void cb;
  return () => undefined;
});
const replaceBlocks = vi.fn();
const transact = vi.fn((cb: (tr: { setMeta: ReturnType<typeof vi.fn> }) => void) => {
  cb({ setMeta: vi.fn() });
});
const focus = vi.fn();
const blocksToMarkdownLossy = vi.fn(() => '');
const tryParseMarkdownToBlocks = vi.fn(() => []);
const tryParseHTMLToBlocks = vi.fn(() => []);

vi.mock('@blocknote/core/extensions', () => ({
  filterSuggestionItems: vi.fn((items: unknown[]) => items),
}));

vi.mock('@blocknote/mantine', () => ({
  BlockNoteView: ({ children }: { children?: ReactNode }) => (
    <div data-testid="block-note-view">{children}</div>
  ),
}));

vi.mock('@blocknote/react', () => ({
  SuggestionMenuController: () => null,
  getDefaultReactSlashMenuItems: () => [],
  useCreateBlockNote: () => ({
    document: [],
    undo,
    redo,
    canExec,
    getExtension,
    onChange,
    replaceBlocks,
    transact,
    focus,
    blocksToMarkdownLossy,
    tryParseMarkdownToBlocks,
    tryParseHTMLToBlocks,
  }),
}));

vi.mock('@/lib/api/upload', () => ({
  imageUploadMessages: { failed: 'upload failed' },
  uploadImageFile: vi.fn(),
}));

import { ProductDescriptionBlockEditor } from './product-description-block-editor';

describe('ProductDescriptionBlockEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canExec.mockImplementation((command: unknown) => command === undoCommand);
    getExtension.mockImplementation((key: string) => {
      if (key === 'history') {
        return { undoCommand, redoCommand };
      }
      return undefined;
    });
  });

  it('renders undo enabled and redo disabled from empty history state', () => {
    render(<ProductDescriptionBlockEditor id="description" value="" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'ยกเลิก' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'ทำซ้ำ' })).toBeDisabled();
  });

  it('calls editor.undo and editor.redo from toolbar buttons', async () => {
    const user = userEvent.setup();
    canExec.mockImplementation(() => true);

    render(<ProductDescriptionBlockEditor id="description" value="" onChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'ยกเลิก' }));
    await user.click(screen.getByRole('button', { name: 'ทำซ้ำ' }));

    expect(undo).toHaveBeenCalled();
    expect(redo).toHaveBeenCalled();
  });

  it('hydrates with addToHistory disabled', () => {
    render(<ProductDescriptionBlockEditor id="description" value="## Hello" onChange={vi.fn()} />);

    expect(transact).toHaveBeenCalled();
    expect(replaceBlocks).toHaveBeenCalled();
    const tr = { setMeta: vi.fn() };
    const cb = transact.mock.calls[0]?.[0] as (transaction: typeof tr) => void;
    cb(tr);
    expect(tr.setMeta).toHaveBeenCalledWith('addToHistory', false);
  });
});
