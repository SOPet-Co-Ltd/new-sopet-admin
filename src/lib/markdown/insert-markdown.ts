export type MarkdownInsertAction = 'bold' | 'h2' | 'h3' | 'ul' | 'ol' | 'link';

export type InsertMarkdownResult = {
  nextValue: string;
  selectionStart: number;
  selectionEnd: number;
};

function lineStartIndex(value: string, index: number): number {
  const lastNewline = value.lastIndexOf('\n', Math.max(0, index - 1));
  return lastNewline === -1 ? 0 : lastNewline + 1;
}

function insertLinePrefix(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
): InsertMarkdownResult {
  const lineStart = lineStartIndex(value, selectionStart);
  if (value.slice(lineStart, lineStart + prefix.length) === prefix) {
    return { nextValue: value, selectionStart, selectionEnd };
  }

  const nextValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  const offset = prefix.length;
  return {
    nextValue,
    selectionStart: selectionStart + offset,
    selectionEnd: selectionEnd + offset,
  };
}

export function insertMarkdownAtCursor(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  action: MarkdownInsertAction,
): InsertMarkdownResult {
  const selected = value.slice(selectionStart, selectionEnd);

  switch (action) {
    case 'bold': {
      if (selected) {
        const wrapped = `**${selected}**`;
        const nextValue = value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd);
        return {
          nextValue,
          selectionStart,
          selectionEnd: selectionStart + wrapped.length,
        };
      }

      const insert = '**ข้อความ**';
      const nextValue = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
      return {
        nextValue,
        selectionStart: selectionStart + 2,
        selectionEnd: selectionStart + 9,
      };
    }
    case 'h2':
      return insertLinePrefix(value, selectionStart, selectionEnd, '## ');
    case 'h3':
      return insertLinePrefix(value, selectionStart, selectionEnd, '### ');
    case 'ul':
      return insertLinePrefix(value, selectionStart, selectionEnd, '- ');
    case 'ol':
      return insertLinePrefix(value, selectionStart, selectionEnd, '1. ');
    case 'link': {
      if (selected) {
        const wrapped = `[${selected}](https://)`;
        const nextValue = value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd);
        return {
          nextValue,
          selectionStart: selectionStart + selected.length + 3,
          selectionEnd: selectionStart + selected.length + 10,
        };
      }

      const insert = '[ข้อความ](https://)';
      const nextValue = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
      return {
        nextValue,
        selectionStart: selectionStart + 1,
        selectionEnd: selectionStart + 8,
      };
    }
    default:
      return { nextValue: value, selectionStart, selectionEnd };
  }
}
