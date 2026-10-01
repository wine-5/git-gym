import { useMemo } from 'react';
import styles from './Confetti.module.css';

const COLORS = ['#f05033', '#4cc38a', '#5aa9ff', '#e8c46a', '#b48cff', '#ff8fab'];

/** 画面の上から紙吹雪を降らせる（表示している間だけ） */
export function Confetti({ count = 80 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 160,
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [count],
  );

  return (
    <div className={styles.layer} aria-hidden>
      {pieces.map((p, i) => (
        <i
          key={i}
          className={p.round ? `${styles.piece} ${styles.round}` : styles.piece}
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--rotate': `${p.rotate}deg`,
              '--drift': `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
