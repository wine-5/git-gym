import { observer } from 'mobx-react-lite';
import { FolderOpen, ChevronDown, Files } from 'lucide-react';
import type { FileState } from '@shared/repo';
import type { WorkspaceModel } from '@models/WorkspaceModel';
import { FILE_STATE_MARKS } from '../fileStates';
import { FileIcon } from './FileIcon';
import { focusEditorSoon } from './CodeEditor';
import styles from './FileTree.module.css';

interface Props {
  workspace: WorkspaceModel;
  projectName: string;
  fileStates: Map<string, FileState>;
}

export const FileTree = observer(({ workspace, projectName, fileStates }: Props) => (
  <div className={styles.tree}>
    <div className="panel-head">
      <span className={styles.headLabel}>
        <Files size={13} /> ファイル
      </span>
    </div>
    <div className={styles.folder}>
      <ChevronDown size={14} />
      <FolderOpen size={15} className={styles.folderIcon} />
      {projectName}
    </div>
    <ul>
      {workspace.paths.map((path) => {
        const state = fileStates.get(path);
        const mark = state ? FILE_STATE_MARKS[state] : null;
        return (
          <li
            key={path}
            className={workspace.activePath === path ? styles.selected : undefined}
            onClick={() => (workspace.open(path), focusEditorSoon())}
          >
            <FileIcon path={path} />
            <span className={styles.name} style={mark ? { color: mark.color } : undefined}>
              {path}
            </span>
            {mark && (
              <span className={styles.mark} style={{ color: mark.color }} title={mark.label}>
                {mark.letter}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  </div>
));
