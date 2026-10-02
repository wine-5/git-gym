import { useEffect, useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { ArrowLeftRight } from 'lucide-react';
import type { DockSlotId, LayoutModel } from '@models/LayoutModel';
import { t } from '@i18n/t';
import styles from './DockSlot.module.css';

/** ドラッグ中のデータの種類（ファイルや文字のドラッグと区別する） */
const MIME = 'application/x-git-gym-dock';
/** パネルの見出し。ここを掴んでドラッグする */
const HANDLE = '.panel-head, [data-dock-handle]';

interface Props {
  slot: DockSlotId;
  layout: LayoutModel;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * パネルを置く場所。Unity のエディタのように、パネルの見出しを別の場所へドラッグすると入れ替わる。
 */
export const DockSlot = observer(({ slot, layout, style, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState(false);
  // 描画中に引いておくと、表示言語を変えたときに描き直されて見出しの説明も切り替わる
  const handleTitle = t('dock.handleTitle');

  // 中身のパネルが変わるたびに、見出しを掴めるようにする
  useEffect(() => {
    const head = ref.current?.querySelector<HTMLElement>(HANDLE);
    if (!head) return;
    head.draggable = true;
    head.classList.add(styles.handle);
    // パネル自身の説明があればそちらを残す。前にここで付けた説明なら今の言語のものに替える
    if (!head.title || head.dataset.dockTitle === head.title) {
      head.title = handleTitle;
      head.dataset.dockTitle = handleTitle;
    }
  });

  const isDockDrag = (e: DragEvent) => e.dataTransfer.types.includes(MIME);

  const onDragStart = (e: DragEvent) => {
    if (!(e.target instanceof Element) || !e.target.closest(HANDLE)) return;
    e.dataTransfer.setData(MIME, slot);
    e.dataTransfer.effectAllowed = 'move';
    layout.setDragging(slot);
  };

  const onDragOver = (e: DragEvent) => {
    if (!isDockDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOver(true);
  };

  const onDragLeave = (e: DragEvent) => {
    if (!ref.current?.contains(e.relatedTarget as Node | null)) setOver(false);
  };

  const onDrop = (e: DragEvent) => {
    if (!isDockDrag(e)) return;
    e.preventDefault();
    setOver(false);
    const from = e.dataTransfer.getData(MIME) as DockSlotId;
    if (from) layout.swapPanels(from, slot);
    layout.setDragging(null);
  };

  const dragging = layout.draggingSlot;
  const className = [styles.slot, dragging && dragging !== slot && styles.candidate, over && dragging !== slot && styles.over]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onDragStart={onDragStart}
      onDragEnd={() => layout.setDragging(null)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      {over && dragging !== slot && (
        <div className={styles.dropHint}>
          <ArrowLeftRight size={18} /> {t('dock.dropHere')}
        </div>
      )}
    </div>
  );
});
