import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { GitGraph, FolderTree, MousePointerClick } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { findLesson, nextLesson } from '@data/lessons';
import { CodeEditor } from '../editor/CodeEditor';
import { EditorTabs } from '../editor/EditorTabs';
import { FileTree } from '../editor/FileTree';
import { MissionPanel } from './MissionPanel';
import { TerminalPanel } from './TerminalPanel';
import { CommitGraph } from './CommitGraph';
import { FileAreas } from './FileAreas';
import { ClearModal } from './ClearModal';
import { Splitter } from '../layout/Splitter';
import { usePanelSize } from '../../hooks/usePanelSize';
import styles from './LessonView.module.css';

export const LessonView = observer(() => {
  const found = findLesson(appModel.currentLessonId);
  const project = appModel.project;
  const session = appModel.lessonSession;
  const runner = appModel.lessonRunner;

  // VS Code のように、各パネルの境目をドラッグして大きさを変えられる（大きさは保存される）
  const mission = usePanelSize('mission', 290, 220, 520);
  const side = usePanelSize('side', 360, 260, 640);
  const tree = usePanelSize('tree', 200, 130, 420);
  const terminalHeight = usePanelSize('terminal', 250, 110, 640);
  const areasHeight = usePanelSize('areas', 236, 150, 520);

  // 実フォルダ（ドキュメント/GitGym/lessons/<id>）を用意してターミナルをつなぐ。開いた時点の状態でも判定する
  useEffect(() => {
    void session?.open().then(() => runner?.evaluate());
  }, [session, runner]);

  if (!found || !project || !session || !runner) return null;

  const { workspace, repo, fileStates } = session;
  const next = nextLesson(found.lesson.id);

  return (
    <main
      className={styles.lesson}
      style={{ gridTemplateColumns: `${mission.size}px auto minmax(0, 1fr) auto ${side.size}px` }}
    >
      <MissionPanel chapter={found.chapter} lessonIndex={found.index} runner={runner} />
      <Splitter direction="columns" {...mission.splitter()} />

      <section className={styles.center} style={{ gridTemplateRows: `minmax(0, 1fr) auto ${terminalHeight.size}px` }}>
        <div className={styles.editorArea} style={{ gridTemplateColumns: `${tree.size}px auto minmax(0, 1fr)` }}>
          <FileTree workspace={workspace} projectName={project.name} fileStates={fileStates} />
          <Splitter direction="columns" {...tree.splitter()} />
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
        <Splitter direction="rows" {...terminalHeight.splitter(true)} />
        <TerminalPanel terminal={session.terminal} branch={repo.branch ?? undefined} onReveal={() => session.reveal()} />
      </section>

      {runner.completed && !runner.celebrated && (
        <ClearModal
          lessonTitle={found.lesson.title}
          nextTitle={next?.title}
          onNext={next ? () => (runner.markCelebrated(), appModel.openLesson(next.id)) : undefined}
          onRetry={() => void appModel.resetLesson()}
          onHome={() => (runner.markCelebrated(), appModel.navigate('home'))}
          onClose={() => runner.markCelebrated()}
        />
      )}

      <Splitter direction="columns" {...side.splitter(true)} />
      <section className={styles.side}>
        <div className="panel-head">
          <span className={styles.headLabel}>
            <GitGraph size={13} /> コミットグラフ
          </span>
        </div>
        <div className={styles.graphScroll}>
          <CommitGraph repo={repo} />
        </div>
        <Splitter direction="rows" {...areasHeight.splitter(true)} />
        <div className={styles.areas} style={{ height: areasHeight.size }}>
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
