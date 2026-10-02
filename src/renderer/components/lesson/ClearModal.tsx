import { useEffect, useRef, type KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { Trophy, ArrowRight, RotateCcw, Home, Star } from 'lucide-react';
import { Confetti } from '../effects/Confetti';
import { t } from '@i18n/t';
import styles from './ClearModal.module.css';

interface Props {
  lessonTitle: string;
  nextTitle?: string;
  onNext?: () => void;
  onRetry: () => void;
  onHome: () => void;
  onClose: () => void;
}

const CLEAR_TEXT = 'MISSION CLEAR!';
/** メダルの厚み（重ねる円盤の枚数） */
const MEDAL_LAYERS = 10;

/** レッスンをクリアしたときのお祝い。回転しながら飛んでくる立体のメダルと光の演出 */
export const ClearModal = observer(({ lessonTitle, nextTitle, onNext, onRetry, onHome, onClose }: Props) => {
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
        <div className={styles.flash} aria-hidden />
        <div className={styles.rays} aria-hidden />
        <div className={styles.ring} aria-hidden />
        <div className={`${styles.ring} ${styles.ring2}`} aria-hidden />
        <div
          ref={modalRef}
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal
        >
          <div className={styles.medalStage} aria-hidden>
            <div className={styles.medalFloat}>
              <div className={styles.medal}>
                {Array.from({ length: MEDAL_LAYERS }, (_, i) => (
                  <i key={i} className={styles.edge} style={{ transform: `translateZ(${i - MEDAL_LAYERS / 2}px)` }} />
                ))}
                <div className={`${styles.face} ${styles.front}`}>
                  <Trophy size={52} strokeWidth={2.2} />
                </div>
                <div className={`${styles.face} ${styles.back}`}>
                  <Star size={52} fill="currentColor" />
                </div>
              </div>
            </div>
            <i className={`${styles.sparkle} ${styles.s1}`} />
            <i className={`${styles.sparkle} ${styles.s2}`} />
            <i className={`${styles.sparkle} ${styles.s3}`} />
          </div>
          <div className={styles.clear} aria-label={t('clear.ariaLabel')}>
            {[...CLEAR_TEXT].map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.55 + i * 0.045}s` }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </div>
          <div className={styles.title}>{lessonTitle}</div>
          <p className={styles.message}>
            {onNext ? t('clear.message') : t('clear.messageFinal')}
          </p>

          <div className={styles.actions}>
            {onNext && nextTitle && (
              <button className={`btn primary ${styles.next}`} onClick={onNext}>
                {t('clear.next', { title: nextTitle })} <ArrowRight size={16} />
              </button>
            )}
            <div className={styles.sub}>
              <button className="btn" onClick={onRetry}>
                <RotateCcw size={14} /> {t('clear.retry')}
              </button>
              <button className="btn" onClick={onHome}>
                <Home size={14} /> {t('clear.home')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
