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
  return (
    <>
      <Confetti />
      <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
          <div className={styles.trophy}>
            <Trophy size={44} />
          </div>
          <div className={styles.clear}>
            <PartyPopper size={18} /> ミッションクリア！
          </div>
          <div className={styles.title}>{lessonTitle}</div>
          <p className={styles.message}>よくできました。Git の操作が1つ身につきました。</p>

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
