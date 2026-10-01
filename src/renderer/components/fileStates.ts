import type { FileState } from '@shared/repo';

/** ファイルの Git 上の状態を表す1文字と説明・色 */
export const FILE_STATE_MARKS: Record<FileState, { letter: string; label: string; color: string }> = {
  modified: { letter: 'M', label: '変更あり', color: 'var(--yellow)' },
  untracked: { letter: 'U', label: '新しいファイル（まだ Git が知らない）', color: 'var(--green)' },
  added: { letter: 'A', label: 'ステージに追加済み', color: 'var(--green)' },
  deleted: { letter: 'D', label: '削除', color: 'var(--red)' },
  renamed: { letter: 'R', label: '名前を変更', color: 'var(--green)' },
  conflicted: { letter: '!', label: 'コンフリクト（衝突）', color: 'var(--red)' },
};
