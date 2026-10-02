import { useEffect } from 'react';
import type { LayoutModel } from '@models/LayoutModel';
import type { WorkspaceModel } from '@models/WorkspaceModel';
import { focusEditor } from '@components/editor/CodeEditor';
import { t } from '@i18n/t';

interface Shortcut {
  /** React の key に使う固定の名前 */
  id: string;
  /** 今の表示言語でのキーの書き方と操作の説明（参照するたびに t() で引く） */
  readonly keys: string;
  readonly action: string;
}

/** keys を省くと、キーの書き方も翻訳（shortcut.<id>.keys）から引く */
function shortcut(id: string, keys?: string): Shortcut {
  return {
    id,
    get keys() {
      return keys ?? t(`shortcut.${id}.keys`);
    },
    get action() {
      return t(`shortcut.${id}`);
    },
  };
}

/** VS Code と同じショートカットの一覧（設定画面にも表示する） */
export const VSCODE_SHORTCUTS: Shortcut[] = [
  shortcut('terminal'),
  shortcut('terminalFocus'),
  shortcut('panel', 'Ctrl + J'),
  shortcut('explorer', 'Ctrl + B'),
  shortcut('side', 'Ctrl + Alt + B'),
  shortcut('showExplorer', 'Ctrl + Shift + E'),
  shortcut('editor', 'Ctrl + 1'),
  shortcut('closeTab', 'Ctrl + W'),
  shortcut('nextTab', 'Ctrl + Tab / Ctrl + PageDown'),
  shortcut('prevTab', 'Ctrl + Shift + Tab / Ctrl + PageUp'),
  shortcut('clear', 'Ctrl + L'),
  shortcut('history', '↑ / ↓'),
  shortcut('complete', 'Tab'),
];

function terminalInput(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>('[data-terminal-input]');
}

/** パネルを開いた直後は入力欄がまだ無いので、描画のあとにフォーカスする */
function focusTerminalSoon(): void {
  setTimeout(() => terminalInput()?.focus(), 0);
}

/** 「`」キー。JIS 配列では同じ位置のキーが「@」なので両方受け付ける（VS Code も同じ挙動） */
function isBackquote(e: KeyboardEvent): boolean {
  return e.code === 'Backquote' || e.key === '`' || e.key === '@';
}

/**
 * レッスン・ステージ・フリー練習の画面で、VS Code と同じショートカットを使えるようにする。
 * Monaco エディタより先に受け取れるよう、キャプチャ段階で拾う。
 */
export function useVsCodeShortcuts(layout: LayoutModel, workspace: WorkspaceModel): void {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      const terminalFocused = document.activeElement === terminalInput();
      let handled = true;

      if (isBackquote(e) && e.shiftKey) {
        layout.setTerminalOpen(true);
        focusTerminalSoon();
      } else if (isBackquote(e)) {
        // 閉じていれば開く／開いていてフォーカスが無ければ移す／ターミナルにいれば閉じる
        if (!layout.terminalOpen) {
          layout.setTerminalOpen(true);
          focusTerminalSoon();
        } else if (!terminalFocused) {
          focusTerminalSoon();
        } else {
          layout.setTerminalOpen(false);
          focusEditor();
        }
      } else if (e.code === 'KeyJ' && !e.shiftKey && !e.altKey) {
        if (layout.terminalOpen) {
          layout.setTerminalOpen(false);
          if (terminalFocused) focusEditor();
        } else {
          layout.setTerminalOpen(true);
          focusTerminalSoon();
        }
      } else if (e.code === 'KeyB' && e.altKey && !e.shiftKey) {
        layout.toggleSide();
      } else if (e.code === 'KeyB' && !e.shiftKey) {
        layout.toggleExplorer();
      } else if (e.code === 'KeyE' && e.shiftKey) {
        layout.setExplorerOpen(true);
      } else if (e.code === 'Digit1' && !e.shiftKey && !e.altKey) {
        focusEditor();
      } else if ((e.code === 'KeyW' && !e.shiftKey) || e.code === 'F4') {
        workspace.closeActive();
      } else if (e.code === 'Tab') {
        workspace.cycleTab(e.shiftKey ? -1 : 1);
      } else if (e.code === 'PageDown') {
        workspace.cycleTab(1);
      } else if (e.code === 'PageUp') {
        workspace.cycleTab(-1);
      } else {
        handled = false;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handle, true);
    return () => window.removeEventListener('keydown', handle, true);
  }, [layout, workspace]);
}
