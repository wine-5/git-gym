import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { TerminalSquare, CheckCircle2, Lightbulb, ChevronRight, Trash2, FolderOpen, Loader2, Flame, X } from 'lucide-react';
import type { TerminalLine, TerminalModel } from '@models/TerminalModel';
import { complete, type CompletionSource } from '@data/completion';
import { parseAnsi, VSCODE_ANSI_COLORS, type AnsiStyle } from '@data/ansi';
import styles from './TerminalPanel.module.css';

interface Props {
  terminal: TerminalModel;
  branch?: string;
  onReveal?: () => void;
  /** パネルを閉じる（Ctrl+` / Ctrl+J でも開け閉めできる） */
  onClose?: () => void;
  /** Tab 補完の候補（ブランチ名・ファイル名など） */
  completion?: () => CompletionSource;
  fontSize?: number;
}

export const TerminalPanel = observer(({ terminal, branch, onReveal, onClose, completion, fontSize }: Props) => {
  const [input, setInput] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Enter を押したときにターミナルにフォーカスがあったか（実行後にフォーカスを戻すため） */
  const refocusAfterRun = useRef(false);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [terminal.lines.length, terminal.running]);

  // 実行が終わったら入力欄にフォーカスを戻して、続けてコマンドを打てるようにする
  useEffect(() => {
    if (!terminal.running && refocusAfterRun.current) {
      refocusAfterRun.current = false;
      inputRef.current?.focus();
    }
  }, [terminal.running]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      refocusAfterRun.current = true;
      void terminal.execute(input, branch);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setInput(terminal.previous());
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setInput(terminal.next());
    } else if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && completion) {
      e.preventDefault();
      const result = complete(input, completion());
      setInput(result.value);
      if (result.candidates.length > 0) terminal.push('output', result.candidates.join('    '));
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      terminal.clear();
    }
  };

  return (
    <div className={styles.terminal}>
      <div className={styles.head}>
        <span className={styles.tab}>
          <TerminalSquare size={13} /> ターミナル
        </span>
        {terminal.streak >= 3 && (
          <span key={terminal.streak} className={styles.combo} title="失敗せずに続けて成功したコマンドの数">
            <Flame size={13} /> {terminal.streak} COMBO
          </span>
        )}
        <span className={styles.cwd}>{terminal.cwd}</span>
        {onReveal && (
          <button className={styles.iconButton} onClick={onReveal} title="フォルダを開く">
            <FolderOpen size={13} />
          </button>
        )}
        <button className={styles.iconButton} onClick={() => terminal.clear()} title="クリア（Ctrl+L）">
          <Trash2 size={13} />
        </button>
        {onClose && (
          <button className={styles.iconButton} onClick={onClose} title="パネルを閉じる（Ctrl+J）">
            <X size={14} />
          </button>
        )}
      </div>
      <div className={styles.body} style={{ fontSize }} ref={bodyRef} onClick={() => inputRef.current?.focus()}>
        {terminal.lines.map((line, i) => (
          <Line key={i} line={line} />
        ))}
        {terminal.running && (
          <div className={`${styles.line} ${styles.output}`}>
            <Loader2 size={14} className={styles.spin} /> 実行中…
          </div>
        )}
        {/* 実行中も入力欄は残す。visibility: hidden にするとフォーカスが外れるので、透明にするだけにする */}
        <div className={styles.inputRow} style={terminal.running ? { opacity: 0 } : undefined}>
          <Prompt cwd={terminal.cwd} branch={branch} />
          <input
            ref={inputRef}
            data-terminal-input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoFocus
            readOnly={terminal.running}
            placeholder="git コマンドを入力…（help で使えるコマンド一覧）"
          />
        </div>
      </div>
    </div>
  );
});

function Prompt({ cwd, branch }: { cwd?: string; branch?: string }) {
  return (
    <span className={styles.prompt}>
      <ChevronRight size={14} className={styles.chevron} />
      <span className={styles.path}>{cwd}</span>
      {branch && <span className={styles.branch}>({branch})</span>}
    </span>
  );
}

function Line({ line }: { line: TerminalLine }) {
  switch (line.kind) {
    case 'command':
      return (
        <div className={styles.line}>
          <Decoration exitCode={line.exitCode} />
          <Prompt cwd={line.cwd} branch={line.branch} />
          <span className={styles.command}>{line.text}</span>
        </div>
      );
    case 'success':
      return (
        <div className={`${styles.feedback} ${styles.success}`}>
          <CheckCircle2 size={14} /> {line.text}
        </div>
      );
    case 'hint':
      return (
        <div className={`${styles.feedback} ${styles.hint}`}>
          <Lightbulb size={14} /> {line.text}
        </div>
      );
    default:
      return (
        <div className={`${styles.block} ${styles.output}`}>
          <AnsiText text={line.text} />
        </div>
      );
  }
}

/** VS Code のコマンドの印: 実行中は白抜き、成功は青い丸、失敗は赤い丸 */
function Decoration({ exitCode }: { exitCode?: number }) {
  if (exitCode === undefined) return <span className={`${styles.decoration} ${styles.decorationRunning}`} title="実行中" />;
  return exitCode === 0 ? (
    <span className={`${styles.decoration} ${styles.decorationSuccess}`} title="成功" />
  ) : (
    <span className={`${styles.decoration} ${styles.decorationError}`} title={`失敗（終了コード ${exitCode}）`} />
  );
}

/** VS Code と同じく、太字の標準色は明るい色で表示する */
function cssFor(style: AnsiStyle): CSSProperties | undefined {
  let { fg, bg } = style;
  const index = fg ? VSCODE_ANSI_COLORS.indexOf(fg) : -1;
  if (style.bold && index >= 0 && index < 8) fg = VSCODE_ANSI_COLORS[index + 8];
  if (style.inverse) [fg, bg] = [bg ?? 'var(--bg-terminal)', fg ?? 'var(--terminal-fg)'];
  const css: CSSProperties = {};
  if (fg) css.color = fg;
  if (bg) css.background = bg;
  if (style.bold) css.fontWeight = 700;
  if (style.dim) css.opacity = 0.5;
  if (style.italic) css.fontStyle = 'italic';
  if (style.underline) css.textDecoration = 'underline';
  return Object.keys(css).length ? css : undefined;
}

function AnsiText({ text }: { text: string }) {
  return (
    <span>
      {parseAnsi(text).map((segment, i) => (
        <span key={i} style={cssFor(segment.style)}>
          {segment.text}
        </span>
      ))}
    </span>
  );
}
