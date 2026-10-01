import type { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { GitGraph, FolderTree, MousePointerClick } from 'lucide-react';
import type { PracticeSession } from '@models/PracticeSession';
import { appModel } from '@models/AppModel';
import { CodeEditor } from '../editor/CodeEditor';
import { EditorTabs } from '../editor/EditorTabs';
import { FileTree } from '../editor/FileTree';
import { TerminalPanel } from '../lesson/TerminalPanel';
import { CommitGraph } from '../lesson/CommitGraph';
import { FileAreas } from '../lesson/FileAreas';
import { Splitter } from '../layout/Splitter';
import { usePanelSize } from '../../hooks/usePanelSize';
import styles from './PracticeLayout.module.css';

interface Props {
  session: PracticeSession;
  /** 左の欄（ミッションやフリー練習の案内） */
  left: ReactNode;
}

/**
 * レッスンとフリー練習で共通の画面構成：左の欄｜エディタ＋ターミナル｜コミットグラフ＋ファイルの居場所。
 * VS Code のように、各パネルの境目をドラッグして大きさを変えられる（大きさは保存される）。
 */
export const PracticeLayout = observer(({ session, left }: Props) => {
  const leftPanel = usePanelSize('mission', 290, 250, 520);
  const side = usePanelSize('side', 360, 260, 640);
  const tree = usePanelSize('tree', 200, 130, 420);
  const terminalHeight = usePanelSize('terminal', 250, 110, 640);
  const areasHeight = usePanelSize('areas', 236, 150, 520);

  const { workspace, repo, fileStates } = session;

  return (
    <main
      className={styles.layout}
      style={{ gridTemplateColumns: `${leftPanel.size}px auto minmax(0, 1fr) auto ${side.size}px` }}
    >
      {left}
      <Splitter direction="columns" {...leftPanel.splitter()} />

      <section className={styles.center} style={{ gridTemplateRows: `minmax(0, 1fr) auto ${terminalHeight.size}px` }}>
        <div className={styles.editorArea} style={{ gridTemplateColumns: `${tree.size}px auto minmax(0, 1fr)` }}>
          <FileTree workspace={workspace} projectName={session.displayName} fileStates={fileStates} />
          <Splitter direction="columns" {...tree.splitter()} />
          <div className={styles.editor}>
            <EditorTabs workspace={workspace} fileStates={fileStates} />
            {workspace.activePath ? (
              <CodeEditor
                path={workspace.activePath}
                value={workspace.activeContent}
                onChange={(path, value) => workspace.update(path, value)}
                fontSize={appModel.settings.editorFontSize}
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
        <TerminalPanel
          terminal={session.terminal}
          branch={repo.branch ?? undefined}
          onReveal={() => session.reveal()}
          fontSize={appModel.settings.terminalFontSize}
        />
      </section>

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
