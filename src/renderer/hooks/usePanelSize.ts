import { useCallback, useRef, useState } from 'react';

const PREFIX = 'git-gym.panel.';

function load(key: string, fallback: number): number {
  try {
    const value = Number(localStorage.getItem(PREFIX + key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  } catch {
    return fallback;
  }
}

/**
 * ドラッグで変えられるパネルの大きさ（px）。min〜max に収め、次に開いたときのために保存する。
 */
export function usePanelSize(key: string, initial: number, min: number, max: number) {
  const clamp = useCallback((v: number) => Math.min(max, Math.max(min, v)), [min, max]);
  const [size, setSizeState] = useState(() => clamp(load(key, initial)));

  const setSize = useCallback(
    (next: number) => {
      const value = clamp(Math.round(next));
      setSizeState(value);
      try {
        localStorage.setItem(PREFIX + key, String(value));
      } catch {
        // 保存できなくても今回は使える
      }
    },
    [clamp, key],
  );

  const reset = useCallback(() => setSize(initial), [initial, setSize]);

  /** Splitter に渡す props。invert は「境目を左（上）に動かすと大きくなる」パネル用 */
  const base = useRef(size);
  const splitter = (invert = false) => ({
    onDragStart: () => {
      base.current = size;
    },
    onDrag: (delta: number) => setSize(base.current + (invert ? -delta : delta)),
    onReset: reset,
  });

  return { size, setSize, reset, splitter };
}
