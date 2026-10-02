import { useRef, type PointerEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { t } from '@i18n/t';
import styles from './Splitter.module.css';

interface Props {
  /** columns: 左右に並んだパネルの間（横にドラッグ） / rows: 上下の間（縦にドラッグ） */
  direction: 'columns' | 'rows';
  /** ドラッグ開始時からの移動量（px） */
  onDrag: (delta: number) => void;
  onDragStart?: () => void;
  /** ダブルクリックで元の大きさに戻す */
  onReset?: () => void;
}

/** VS Code のように、ドラッグでパネルの大きさを変える境目 */
export const Splitter = observer(({ direction, onDrag, onDragStart, onReset }: Props) => {
  const start = useRef<number | null>(null);

  const handleDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = direction === 'columns' ? e.clientX : e.clientY;
    onDragStart?.();
    document.body.classList.add(direction === 'columns' ? styles.draggingColumns : styles.draggingRows);
  };

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current === null) return;
    onDrag((direction === 'columns' ? e.clientX : e.clientY) - start.current);
  };

  const handleUp = (e: PointerEvent<HTMLDivElement>) => {
    start.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.classList.remove(styles.draggingColumns, styles.draggingRows);
  };

  return (
    <div
      className={direction === 'columns' ? styles.columns : styles.rows}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onDoubleClick={onReset}
      title={t('layout.splitterTitle')}
      role="separator"
      aria-orientation={direction === 'columns' ? 'vertical' : 'horizontal'}
    />
  );
});
