/**
 * Point @monaco-editor/react at same-origin Monaco assets under /monaco/vs
 * (copied from node_modules by scripts/copy-monaco.mjs). Avoids the default
 * jsDelivr CDN, which production CSP script-src 'self' blocks.
 */
import { loader } from '@monaco-editor/react';

let configured = false;

export function setupMonaco(): void {
  if (configured || typeof window === 'undefined') {
    return;
  }

  loader.config({
    paths: {
      vs: '/monaco/vs',
    },
  });
  configured = true;
}
