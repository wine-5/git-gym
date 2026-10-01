import { observer } from 'mobx-react-lite';
import { FolderOpen, ChevronDown, Files } from 'lucide-react';
import type { WorkspaceModel } from '@models/WorkspaceModel';
import { FileIcon } from './FileIcon';
import styles from './FileTree.module.css';

export const FileTree = observer(({ workspace }: { workspace: WorkspaceModel }) => (
  <div className={styles.tree}>
    <div className="panel-head">
      <span className={styles.headLabel}>
        <Files size={13} /> ファイル
      </span>
    </div>
    <div className={styles.folder}>
      <ChevronDown size={14} />
      <FolderOpen size={15} className={styles.folderIcon} />
      {workspace.projectName}
    </div>
    <ul>
      {workspace.paths.map((path) => (
        <li
          key={path}
          className={workspace.activePath === path ? styles.selected : undefined}
          onClick={() => workspace.open(path)}
        >
          <FileIcon path={path} />
          <span className={styles.name}>{path}</span>
          {workspace.isModified(path) && (
            <span className={styles.modified} title="変更あり">
              M
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
));
