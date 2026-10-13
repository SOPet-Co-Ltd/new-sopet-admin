'use client';

import { filterSuggestionItems } from '@blocknote/core/extensions';
import { BlockNoteView } from '@blocknote/mantine';
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from '@blocknote/react';
import { useEffect, useRef, useState } from 'react';
import { HiArrowUturnLeft, HiArrowUturnRight } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/errors';
import { imageUploadMessages, uploadImageFile } from '@/lib/api/upload';
import { productDescriptionDictionary } from '@/lib/markdown/product-description-locale';
import {
  DESCRIPTION_IMAGE_LIMIT_MESSAGE,
  PRODUCT_DESCRIPTION_SLASH_KEYS,
  productDescriptionSchema,
} from '@/lib/markdown/product-description-schema';
import {
  assertDescriptionImageLimit,
  normalizeDescriptionMarkdown,
  parseDescriptionToBlocks,
} from '@/lib/markdown/product-description-sync';
import { cn } from '@/lib/utils';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

type HistoryCommands = {
  undoCommand: Parameters<ReturnType<typeof useCreateBlockNote>['canExec']>[0];
  redoCommand: Parameters<ReturnType<typeof useCreateBlockNote>['canExec']>[0];
};

function syncHistoryAvailability(
  editor: ReturnType<typeof useCreateBlockNote>,
  setCanUndo: (value: boolean) => void,
  setCanRedo: (value: boolean) => void,
) {
  const history =
    (editor.getExtension('yUndo') as HistoryCommands | undefined) ??
    (editor.getExtension('history') as HistoryCommands | undefined);

  setCanUndo(history ? editor.canExec(history.undoCommand) : false);
  setCanRedo(history ? editor.canExec(history.redoCommand) : false);
}

export type ProductDescriptionBlockEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

export function ProductDescriptionBlockEditor({
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: ProductDescriptionBlockEditorProps) {
  const lastEmittedRef = useRef<string | null>(null);
  const hydratedFromValueRef = useRef(false);
  const editorDocRef = useRef<ReadonlyArray<{ type: string; props?: Record<string, unknown> }>>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const editor = useCreateBlockNote({
    schema: productDescriptionSchema,
    dictionary: productDescriptionDictionary,
    uploadFile: async (file) => {
      try {
        assertDescriptionImageLimit(editorDocRef.current);
        setUploadError(null);
        const uploaded = await uploadImageFile(file, 'products');
        return uploaded.url;
      } catch (err) {
        const message = getErrorMessage(err, imageUploadMessages.failed);
        setUploadError(message);
        throw err;
      }
    },
  });

  // Hydrate from the form value; skip re-replace when we emitted the change.
  useEffect(() => {
    editorDocRef.current = editor.document as ReadonlyArray<{
      type: string;
      props?: Record<string, unknown>;
    }>;

    if (lastEmittedRef.current !== null && value === lastEmittedRef.current) {
      return;
    }

    // Untouched HTML/markdown load — do not call onChange until the vendor edits.
    // Keep hydrate out of the undo stack so Cmd+Z undoes real edits, not the load.
    const blocks = parseDescriptionToBlocks(editor, value);
    editor.transact((tr) => {
      tr.setMeta('addToHistory', false);
      editor.replaceBlocks(editor.document, blocks);
    });
    hydratedFromValueRef.current = true;
    lastEmittedRef.current = value;
    syncHistoryAvailability(editor, setCanUndo, setCanRedo);
  }, [editor, value]);

  useEffect(() => {
    return editor.onChange(() => {
      editorDocRef.current = editor.document as ReadonlyArray<{
        type: string;
        props?: Record<string, unknown>;
      }>;

      syncHistoryAvailability(editor, setCanUndo, setCanRedo);

      if (!hydratedFromValueRef.current) return;

      const markdown = normalizeDescriptionMarkdown(editor.blocksToMarkdownLossy(editor.document));
      if (markdown === lastEmittedRef.current) return;

      lastEmittedRef.current = markdown;
      onChange(markdown);
    });
  }, [editor, onChange]);

  return (
    <div className="relative">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0"
          disabled={disabled || !canUndo}
          aria-label="ยกเลิก"
          onClick={() => {
            editor.undo();
            syncHistoryAvailability(editor, setCanUndo, setCanRedo);
          }}
        >
          <HiArrowUturnLeft className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0"
          disabled={disabled || !canRedo}
          aria-label="ทำซ้ำ"
          onClick={() => {
            editor.redo();
            syncHistoryAvailability(editor, setCanUndo, setCanRedo);
          }}
        >
          <HiArrowUturnRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div
        id={id}
        role="textbox"
        aria-multiline="true"
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className="outline-none"
        onFocus={() => {
          if (!disabled) {
            editor.focus();
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            onBlur?.();
          }
        }}
      >
        <BlockNoteView
          editor={editor}
          editable={!disabled}
          theme="light"
          slashMenu={false}
          className={cn(
            'product-description-block-editor min-h-[120px] bg-transparent',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) => {
              const items = getDefaultReactSlashMenuItems(editor).filter((item) =>
                PRODUCT_DESCRIPTION_SLASH_KEYS.has((item as { key?: string }).key ?? ''),
              );
              return filterSuggestionItems(items, query);
            }}
          />
        </BlockNoteView>
      </div>

      {uploadError ? (
        <p className="mt-2 px-3 text-xs text-danger" role="alert">
          {uploadError}
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {DESCRIPTION_IMAGE_LIMIT_MESSAGE}
      </p>
    </div>
  );
}
