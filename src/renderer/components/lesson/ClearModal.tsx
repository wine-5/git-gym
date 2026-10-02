import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Trophy, ArrowRight, RotateCcw, Home, PartyPopper } from 'lucide-react';
import { Confetti } from '../effects/Confetti';
import styles from './ClearModal.module.css';

interface Props {
  lessonTitle: string;
  nextTitle?: string;
  onNext?: () => void;
  onRetry: () => void;
  onHome: () => void;
  onClose: () => void;
}

/** レッスンをクリアしたときのお祝い */
export function ClearModal({ lessonTitle, nextTitle, onNext, onRetry, onHome, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 開いたら「次へ」（無ければ最初のボタン）を選んだ状態にして、Enter ですぐ進めるようにする
  useEffect(() => {
    modalRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, []);

  /** Tab / Shift+Tab でボタンの間だけを行き来する。Esc で閉じる */
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const buttons = [...(modalRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
    if (buttons.length === 0) return;
    e.preventDefault();
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = (index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next].focus();
  };

  return (
    <>
      <Confetti />
      <div className={styles.backdrop} onClick={onClose}>
        <div
          ref={modalRef}
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal
        >
          <div className={styles.trophy}>
            <Trophy size={44} />
          </div>
          <div className={styles.clear}>
            <PartyPopper size={18} /> ミッションクリア！
          </div>
          <div className={styles.title}>{lessonTitle}</div>
          <p className={styles.message}>
            {onNext
              ? 'よくできました。Git の操作が1つ身につきました。'
              : '全コース修了です！おめでとうございます。もう実際のチーム開発で Git を使えます。フリー練習やコマンド辞典で復習もしてみましょう。'}
          </p>

          <div className={styles.actions}>
            {onNext && nextTitle && (
              <button className={`btn primary ${styles.next}`} onClick={onNext}>
                次へ：{nextTitle} <ArrowRight size={16} />
              </button>
            )}
            <div className={styles.sub}>
              <button className="btn" onClick={onRetry}>
                <RotateCcw size={14} /> もう一度
              </button>
              <button className="btn" onClick={onHome}>
                <Home size={14} /> ホームへ
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
