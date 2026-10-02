import type { FileState } from '@shared/repo';
import { t } from '@i18n/t';

interface FileStateMark {
  letter: string;
  /** 今の表示言語での説明（参照するたびに t() で引く） */
  readonly label: string;
  color: string;
}

function mark(state: FileState, letter: string, color: string): FileStateMark {
  return {
    letter,
    color,
    get label() {
      return t(`fileState.${state}`);
    },
  };
}

/** ファイルの Git 上の状態を表す1文字と説明・色 */
export const FILE_STATE_MARKS: Record<FileState, FileStateMark> = {
  modified: mark('modified', 'M', 'var(--yellow)'),
  untracked: mark('untracked', 'U', 'var(--green)'),
  added: mark('added', 'A', 'var(--green)'),
  deleted: mark('deleted', 'D', 'var(--red)'),
  renamed: mark('renamed', 'R', 'var(--green)'),
  conflicted: mark('conflicted', '!', 'var(--red)'),
};
