import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';
import type { FileState } from '@shared/repo';
import type { WorkspaceModel } from '@models/WorkspaceModel';
import { FILE_STATE_MARKS } from '../fileStates';
import { FileIcon } from './FileIcon';
import { focusEditorSoon } from './CodeEditor';
import { t } from '@i18n/t';
import styles from './EditorTabs.module.css';

interface Props {
  workspace: WorkspaceModel;
  fileStates: Map<string, FileState>;
}

export const EditorTabs = observer(({ workspace, fileStates }: Props) => (
  <div className={styles.tabs}>
    {workspace.openTabs.map((path) => (
      <div
        key={path}
        className={`${styles.tab} ${workspace.activePath === path ? styles.active : ''}`}
        onClick={() => (workspace.open(path), focusEditorSoon())}
      >
        <FileIcon path={path} size={14} />
        {path}
        {fileStates.has(path) && (
          <span
            className={styles.dot}
            style={{ background: FILE_STATE_MARKS[fileStates.get(path)!].color }}
            title={FILE_STATE_MARKS[fileStates.get(path)!].label}
          />
        )}
        <button
          className={styles.close}
          title={t('editor.closeTab')}
          onClick={(e) => {
            e.stopPropagation();
            workspace.close(path);
          }}
        >
          <X size={13} />
        </button>
      </div>
    ))}
  </div>
));
