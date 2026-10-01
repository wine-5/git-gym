import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { TerminalSquare, CheckCircle2, XCircle, Lightbulb, ChevronRight, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import type { TerminalLine, TerminalModel } from '@models/TerminalModel';
import styles from './TerminalPanel.module.css';

interface Props {
  terminal: TerminalModel;
  branch?: string;
  onReveal?: () => void;
  fontSize?: number;
}

export const TerminalPanel = observer(({ terminal, branch, onReveal, fontSize }: Props) => {
  const [input, setInput] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [terminal.lines.length, terminal.running]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void terminal.execute(input, branch);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setInput(terminal.previous());
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setInput(terminal.next());
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
        <span className={styles.cwd}>{terminal.cwd}</span>
        {onReveal && (
          <button className={styles.iconButton} onClick={onReveal} title="フォルダを開く">
            <FolderOpen size={13} />
          </button>
        )}
        <button className={styles.iconButton} onClick={() => terminal.clear()} title="クリア（Ctrl+L）">
          <Trash2 size={13} />
        </button>
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
        {/* 実行中も入力欄は残す（作り直すとフォーカスがエディタから奪われるため） */}
        <div className={styles.inputRow} style={terminal.running ? { visibility: 'hidden' } : undefined}>
          <Prompt cwd={terminal.cwd} branch={branch} />
          <input
            ref={inputRef}
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
    case 'error':
      return (
        <div className={`${styles.block} ${styles.error}`}>
          <XCircle size={14} className={styles.blockIcon} />
          <span>{line.text}</span>
        </div>
      );
    case 'hint':
      return (
        <div className={`${styles.feedback} ${styles.hint}`}>
          <Lightbulb size={14} /> {line.text}
        </div>
      );
    default:
      return <div className={`${styles.block} ${styles.output}`}>{line.text}</div>;
  }
}
