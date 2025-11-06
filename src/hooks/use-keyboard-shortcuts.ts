import { useEffect, useCallback } from 'react';
export type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  global?: boolean;
};
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (event.key !== 'Escape') return;
      }
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey;
        const metaMatches = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey;
        const shiftMatches = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey;
        const altMatches = shortcut.altKey === undefined || shortcut.altKey === event.altKey;
        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress, enabled]);
}
export function useGlobalKeyboardShortcuts() {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      metaKey: true,
      description: 'Open quick navigation',
      action: () => {
        const quickNavButton = document.querySelector('[data-quick-nav-trigger]') as HTMLButtonElement;
        quickNavButton?.click();
      },
      global: true,
    },
    {
      key: '/',
      metaKey: true,
      description: 'Show keyboard shortcuts',
      action: () => {
        const shortcutsButton = document.querySelector('[data-shortcuts-trigger]') as HTMLButtonElement;
        shortcutsButton?.click();
      },
      global: true,
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts (alternative)',
      action: () => {
        const shortcutsButton = document.querySelector('[data-shortcuts-trigger]') as HTMLButtonElement;
        shortcutsButton?.click();
      },
      global: true,
    },
    {
      key: 'Escape',
      description: 'Close modals and dialogs',
      action: () => {
      },
      global: true,
    },
  ];
  useKeyboardShortcuts(shortcuts, true);
  return shortcuts;
}
export function getShortcutText(shortcut: KeyboardShortcut): string {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];
  if (shortcut.ctrlKey) parts.push(isMac ? '⌃' : 'Ctrl');
  if (shortcut.altKey) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shiftKey) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.metaKey) parts.push(isMac ? '⌘' : 'Ctrl');
  let keyName = shortcut.key;
  if (keyName === ' ') keyName = 'Space';
  if (keyName === 'Escape') keyName = 'Esc';
  if (keyName === 'ArrowUp') keyName = '↑';
  if (keyName === 'ArrowDown') keyName = '↓';
  if (keyName === 'ArrowLeft') keyName = '←';
  if (keyName === 'ArrowRight') keyName = '→';
  parts.push(keyName.toUpperCase());
  return parts.join(isMac ? '' : '+');
}
