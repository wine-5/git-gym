import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { GitGraph, FolderTree, MousePointerClick } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { findLesson } from '@data/lessons';
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
  const session = appModel.lessonSession;
  const runner = appModel.lessonRunner;

  // 実フォルダ（ドキュメント/GitGym/lessons/<id>）を用意してターミナルをつなぐ。開いた時点の状態でも判定する
  useEffect(() => {
    void session?.open().then(() => runner?.evaluate());
  }, [session, runner]);

  if (!found || !project || !session || !runner) return null;

  const { workspace, repo, fileStates } = session;

  return (
    <main className={styles.lesson}>
      <MissionPanel chapter={found.chapter} lessonIndex={found.index} runner={runner} />

      <section className={styles.center}>
        <div className={styles.editorArea}>
          <FileTree workspace={workspace} projectName={project.name} fileStates={fileStates} />
          <div className={styles.editor}>
            <EditorTabs workspace={workspace} fileStates={fileStates} />
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
        <TerminalPanel terminal={session.terminal} branch={repo.branch ?? undefined} onReveal={() => session.reveal()} />
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
