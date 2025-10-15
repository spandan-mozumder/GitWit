"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Keyboard, Command } from "lucide-react";
import { getShortcutText, type KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";

interface ShortcutsModalProps {
  shortcuts?: KeyboardShortcut[];
}

const GLOBAL_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'k',
    metaKey: true,
    description: 'Open quick navigation',
    action: () => {},
  },
  {
    key: '/',
    metaKey: true,
    description: 'Show keyboard shortcuts',
    action: () => {},
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts (alternative)',
    action: () => {},
  },
  {
    key: 'Escape',
    description: 'Close modals and dialogs',
    action: () => {},
  },
];

const PAGE_SHORTCUTS: Record<string, KeyboardShortcut[]> = {
  dashboard: [
    {
      key: 'n',
      metaKey: true,
      description: 'Create new project',
      action: () => {},
    },
  ],
  analytics: [
    {
      key: 'r',
      metaKey: true,
      description: 'Refresh analytics data',
      action: () => {},
    },
    {
      key: 'e',
      metaKey: true,
      description: 'Export analytics report',
      action: () => {},
    },
  ],
  codeReview: [
    {
      key: 'n',
      metaKey: true,
      description: 'Create new code review',
      action: () => {},
    },
    {
      key: 'f',
      metaKey: true,
      description: 'Filter reviews',
      action: () => {},
    },
  ],
  teamChat: [
    {
      key: 'Enter',
      description: 'Send message',
      action: () => {},
    },
    {
      key: 'Enter',
      shiftKey: true,
      description: 'New line (in code mode)',
      action: () => {},
    },
    {
      key: 'c',
      metaKey: true,
      shiftKey: true,
      description: 'Open code snippet dialog',
      action: () => {},
    },
    {
      key: 'u',
      metaKey: true,
      shiftKey: true,
      description: 'Upload file',
      action: () => {},
    },
  ],
};

export function KeyboardShortcutsModal({ shortcuts }: ShortcutsModalProps) {
  const [open, setOpen] = useState(false);

  const allShortcuts = shortcuts || GLOBAL_SHORTCUTS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          data-shortcuts-trigger
        >
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Global
            </h3>
            <div className="space-y-2">
              {GLOBAL_SHORTCUTS.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <Kbd>{getShortcutText(shortcut)}</Kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Dashboard
            </h3>
            <div className="space-y-2">
              {PAGE_SHORTCUTS.dashboard.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <Kbd>{getShortcutText(shortcut)}</Kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Analytics
            </h3>
            <div className="space-y-2">
              {PAGE_SHORTCUTS.analytics.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <Kbd>{getShortcutText(shortcut)}</Kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Code Review
            </h3>
            <div className="space-y-2">
              {PAGE_SHORTCUTS.codeReview.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <Kbd>{getShortcutText(shortcut)}</Kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Team Chat
            </h3>
            <div className="space-y-2">
              {PAGE_SHORTCUTS.teamChat.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <Kbd>{getShortcutText(shortcut)}</Kbd>
                </div>
              ))}
            </div>
          </div>

          {shortcuts && shortcuts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Page Specific
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <Kbd>{getShortcutText(shortcut)}</Kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <Kbd className="mx-1">?</Kbd> or <Kbd className="mx-1">⌘/</Kbd> to toggle this help
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
