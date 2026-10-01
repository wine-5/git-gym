import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { GitGraph, FolderTree, MousePointerClick } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { TerminalModel } from '@models/TerminalModel';
import type { WorkspaceRef } from '@shared/api';
import { findLesson } from '@data/lessons';
import { createMockRepo } from '@data/mockRepo';
import type { RepoSnapshot } from '@shared/repo';
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
  const ref = useMemo<WorkspaceRef>(() => ({ kind: 'lessons', id: appModel.currentLessonId }), [appModel.currentLessonId]);
  const terminal = useMemo(() => new TerminalModel(ref), [ref]);

  // 実フォルダ（ドキュメント/GitGym/lessons/<id>）を用意してターミナルをつなぐ
  useEffect(() => {
    if (!project || !window.gitGym) return;
    void window.gitGym.workspace.open(ref, project.name).then((info) => terminal.setCwd(info.cwd));
  }, [ref, terminal, project]);

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
        <TerminalPanel terminal={terminal} branch={repo.branch ?? undefined} onReveal={() => void window.gitGym?.workspace.reveal(ref)} />
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
