import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';
import type { WorkspaceModel } from '@models/WorkspaceModel';
import { FileIcon } from './FileIcon';
import styles from './EditorTabs.module.css';

export const EditorTabs = observer(({ workspace }: { workspace: WorkspaceModel }) => (
  <div className={styles.tabs}>
    {workspace.openTabs.map((path) => (
      <div
        key={path}
        className={`${styles.tab} ${workspace.activePath === path ? styles.active : ''}`}
        onClick={() => workspace.open(path)}
      >
        <FileIcon path={path} size={14} />
        {path}
        {workspace.isModified(path) && <span className={styles.dot} title="変更あり" />}
        <button
          className={styles.close}
          title="閉じる"
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
