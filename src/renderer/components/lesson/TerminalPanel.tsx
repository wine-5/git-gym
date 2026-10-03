import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { TerminalSquare, CheckCircle2, Lightbulb, ChevronRight, Trash2, FolderOpen, Loader2, Flame, X } from 'lucide-react';
import type { TerminalLine, TerminalModel } from '@models/TerminalModel';
import { complete, type CompletionSource } from '@data/completion';
import { highlightCommand } from '@data/commandHighlight';
import { parseAnsi, VSCODE_ANSI_COLORS, type AnsiStyle } from '@data/ansi';
import { t } from '@i18n/t';
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
  const mirrorRef = useRef<HTMLDivElement>(null);

  /** Enter を押したときにターミナルにフォーカスがあったか（実行後にフォーカスを戻すため） */
  const refocusAfterRun = useRef(false);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [terminal.lines.length, terminal.running]);

  // トラックパッドで少し動かしただけで大きく飛ばないよう、ブラウザの慣性つきスクロールを使わず
  // 動かした量だけそのまま動かす（VS Code のターミナルと同じ感覚）
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // Ctrl+ホイールは拡大縮小に使う
      e.preventDefault();
      const lineHeight = parseFloat(getComputedStyle(body).lineHeight) || 20;
      const unit = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? lineHeight : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? body.clientHeight : 1;
      body.scrollTop += e.deltaY * unit;
      body.scrollLeft += e.deltaX * unit;
    };
    body.addEventListener('wheel', onWheel, { passive: false });
    return () => body.removeEventListener('wheel', onWheel);
  }, []);

  // レッスンやステージを開いたら、すぐコマンドを打てるようにターミナルを選んでおく
  useEffect(() => {
    inputRef.current?.focus();
  }, [terminal]);

  /** 実行中に Enter を押したコマンド。本物のターミナルと同じく、終わったら順に実行する */
  const queued = useRef<string[]>([]);

  // 実行が終わったら入力欄にフォーカスを戻して、続けてコマンドを打てるようにする
  useEffect(() => {
    if (terminal.running) return;
    const next = queued.current.shift();
    if (next !== undefined) {
      refocusAfterRun.current = true;
      void terminal.execute(next, branch);
      return;
    }
    if (refocusAfterRun.current) {
      refocusAfterRun.current = false;
      inputRef.current?.focus();
    }
    // branch は実行する瞬間の値を使えばよいので、変わっても実行し直さない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminal.running]);

  // レッスンを切り替えたら、前のターミナル宛ての予約は捨てる
  useEffect(() => {
    queued.current = [];
  }, [terminal]);

  /**
   * ターミナルをクリックしたら入力欄に移る。ただし、ドラッグで文字を選択したときは移らない
   * （入力欄に移ると選択が外れてコピーできなくなるため。次にクリックしたときに選択が外れる）
   */
  const focusInputUnlessSelecting = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && bodyRef.current?.contains(selection.anchorNode)) return;
    inputRef.current?.focus();
  };

  // 選択したあとに文字キーを打ったら、VS Code と同じく入力欄に移ってそのまま打てるようにする
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const selection = window.getSelection();
      const selectingHere = selection && !selection.isCollapsed && bodyRef.current?.contains(selection.anchorNode);
      // エディタなど、ほかの入力欄で打っているときは横取りしない
      const typingElsewhere = document.activeElement?.closest('input, textarea, [contenteditable="true"]');
      if (selectingHere && !typingElsewhere) inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      refocusAfterRun.current = true;
      // 実行中に打った分は覚えておき、今のコマンドが終わってから実行する
      if (terminal.running) {
        if (input.trim()) queued.current.push(input);
      } else {
        void terminal.execute(input, branch);
      }
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
      <div className={styles.head} data-dock-handle>
        <span className={styles.tab}>
          <TerminalSquare size={13} /> {t('terminal.tab')}
        </span>
        {terminal.streak >= 3 && (
          <span key={terminal.streak} className={styles.combo} title={t('terminal.comboTitle')}>
            <Flame size={13} /> {terminal.streak} COMBO
          </span>
        )}
        <span className={styles.cwd}>{terminal.cwd}</span>
        {onReveal && (
          <button className={styles.iconButton} onClick={onReveal} title={t('terminal.reveal')}>
            <FolderOpen size={13} />
          </button>
        )}
        <button className={styles.iconButton} onClick={() => terminal.clear()} title={t('terminal.clear')}>
          <Trash2 size={13} />
        </button>
        {onClose && (
          <button className={styles.iconButton} onClick={onClose} title={t('terminal.close')}>
            <X size={14} />
          </button>
        )}
      </div>
      <div className={styles.body} style={{ fontSize }} ref={bodyRef} onClick={focusInputUnlessSelecting}>
        {terminal.lines.map((line, i) => (
          <Line key={i} line={line} />
        ))}
        {terminal.running && (
          <div className={`${styles.line} ${styles.output}`}>
            <Loader2 size={14} className={styles.spin} /> {t('terminal.running')}
          </div>
        )}
        {/* 実行中も入力欄は残し、打ったキーをそのまま受け付ける（終わったら続きから打てる） */}
        <div className={styles.inputRow}>
          <span style={terminal.running ? { visibility: 'hidden' } : undefined}>
            <Prompt cwd={terminal.cwd} branch={branch} />
          </span>
          {/* 入力欄の文字は透明にして、後ろに色分けした同じ文字を重ねる（PowerShell と同じ色分け） */}
          <div className={styles.inputWrap}>
            <div ref={mirrorRef} className={styles.mirror} aria-hidden>
              <CommandText text={input} />
            </div>
            <input
              ref={inputRef}
              data-terminal-input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              // 長いコマンドで入力欄が横にスクロールしたら、色分けもそろえて動かす
              onScroll={(e) => mirrorRef.current?.scrollTo({ left: e.currentTarget.scrollLeft })}
              onSelect={(e) => mirrorRef.current?.scrollTo({ left: e.currentTarget.scrollLeft })}
              spellCheck={false}
              autoFocus
              placeholder={terminal.running ? '' : t('terminal.placeholder')}
            />
          </div>
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

/** 打ったコマンドを、コマンド名・オプション・文字列で色分けして表示する */
function CommandText({ text }: { text: string }) {
  return (
    <>
      {highlightCommand(text).map((token, i) => (
        <span key={i} className={styles[`tok-${token.kind}`]}>
          {token.text}
        </span>
      ))}
    </>
  );
}

function Line({ line }: { line: TerminalLine }) {
  switch (line.kind) {
    case 'command':
      return (
        <div className={styles.line}>
          <Decoration exitCode={line.exitCode} />
          <Prompt cwd={line.cwd} branch={line.branch} />
          <span className={styles.command}>
            <CommandText text={line.text} />
          </span>
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
const Decoration = observer(({ exitCode }: { exitCode?: number }) => {
  if (exitCode === undefined) return <span className={`${styles.decoration} ${styles.decorationRunning}`} title={t('terminal.statusRunning')} />;
  return exitCode === 0 ? (
    <span className={`${styles.decoration} ${styles.decorationSuccess}`} title={t('terminal.statusSuccess')} />
  ) : (
    <span className={`${styles.decoration} ${styles.decorationError}`} title={t('terminal.statusFailed', { code: exitCode })} />
  );
});

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
