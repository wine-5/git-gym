import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { TerminalSquare, CheckCircle2, XCircle, Lightbulb, ChevronRight, Trash2 } from 'lucide-react';
import { MOCK_TERMINAL, type TerminalLine } from '@data/mockRepo';
import styles from './TerminalPanel.module.css';

interface Props {
  projectName: string;
  branch: string;
}

export function TerminalPanel({ projectName, branch }: Props) {
  const [lines, setLines] = useState<TerminalLine[]>(MOCK_TERMINAL);
  const [input, setInput] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !input.trim()) return;
    // TODO: preload 経由で本物の git を実行する
    setLines((prev) => [
      ...prev,
      { kind: 'command', branch, text: input },
      { kind: 'output', text: '（Git の実行は次のステップで実装予定です）' },
    ]);
    setInput('');
  };

  return (
    <div className={styles.terminal}>
      <div className={styles.head}>
        <span className={styles.tab}>
          <TerminalSquare size={13} /> ターミナル
        </span>
        <span className={styles.cwd}>~/{projectName}</span>
        <button className={styles.clear} onClick={() => setLines([])} title="クリア">
          <Trash2 size={13} />
        </button>
      </div>
      <div className={styles.body} ref={bodyRef} onClick={() => bodyRef.current?.querySelector('input')?.focus()}>
        {lines.map((line, i) => (
          <Line key={i} line={line} projectName={projectName} />
        ))}
        <div className={styles.inputRow}>
          <Prompt projectName={projectName} branch={branch} />
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder="git コマンドを入力…"
          />
        </div>
      </div>
    </div>
  );
}

function Prompt({ projectName, branch }: { projectName: string; branch?: string }) {
  return (
    <span className={styles.prompt}>
      <ChevronRight size={14} className={styles.chevron} />
      <span className={styles.path}>~/{projectName}</span>
      {branch && <span className={styles.branch}>({branch})</span>}
    </span>
  );
}

function Line({ line, projectName }: { line: TerminalLine; projectName: string }) {
  switch (line.kind) {
    case 'command':
      return (
        <div className={styles.line}>
          <Prompt projectName={projectName} branch={line.branch} />
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
        <div className={`${styles.line} ${styles.error}`}>
          <XCircle size={14} /> {line.text}
        </div>
      );
    case 'hint':
      return (
        <div className={`${styles.feedback} ${styles.hint}`}>
          <Lightbulb size={14} /> {line.text}
        </div>
      );
    default:
      return <div className={`${styles.line} ${styles.output}`}>{line.text}</div>;
  }
}
