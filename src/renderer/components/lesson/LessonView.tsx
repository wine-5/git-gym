import { observer } from 'mobx-react-lite';
import { GitGraph, FolderTree, MousePointerClick } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { findLesson } from '@data/lessons';
import { createMockRepo, type RepoSnapshot } from '@data/mockRepo';
import { CodeEditor } from '../editor/CodeEditor';
import { EditorTabs } from '../editor/EditorTabs';
import { FileTree } from '../editor/FileTree';
import { MissionPanel } from './MissionPanel';
import { TerminalPanel } from './TerminalPanel';
import { CommitGraph } from './CommitGraph';
import { FileAreas } from './FileAreas';
import styles from './LessonView.module.css';

export const LessonView = observer(() => {
  const found = findLesson(appModel.currentLessonId);
  const project = appModel.project;
  if (!found || !project) return null;

  const { workspace } = appModel;
  const mock = createMockRepo(project.featureFile);
  // Git 連携までは、エディタで変更したファイルを作業ツリーに出して雰囲気を確認できるようにする
  const repo: RepoSnapshot = {
    ...mock,
    working: workspace.paths.filter((p) => workspace.isModified(p)).map((path) => ({ path, state: 'modified' })),
  };

  return (
    <main className={styles.lesson}>
      <MissionPanel
        chapter={found.chapter}
        lesson={found.lesson}
        lessonIndex={found.index}
        vars={{ mainFile: project.mainFile, featureFile: project.featureFile }}
        doneCount={2}
      />

      <section className={styles.center}>
        <div className={styles.editorArea}>
          <FileTree workspace={workspace} />
          <div className={styles.editor}>
            <EditorTabs workspace={workspace} />
            {workspace.activePath ? (
              <CodeEditor
                path={workspace.activePath}
                value={workspace.activeContent}
                onChange={(path, value) => workspace.update(path, value)}
              />
            ) : (
              <div className={styles.noFile}>
                <MousePointerClick size={36} />
                左のファイル一覧からファイルを開いてください
              </div>
            )}
          </div>
        </div>
        <TerminalPanel projectName={project.name} branch={repo.branch} />
      </section>

      <section className={styles.side}>
        <div className="panel-head">
          <span className={styles.headLabel}>
            <GitGraph size={13} /> コミットグラフ
          </span>
        </div>
        <div className={styles.graphScroll}>
          <CommitGraph repo={repo} />
        </div>
        <div className={styles.areas}>
          <div className="panel-head">
            <span className={styles.headLabel}>
              <FolderTree size={13} /> ファイルの居場所
            </span>
          </div>
          <FileAreas repo={repo} />
        </div>
      </section>
    </main>
  );
});
